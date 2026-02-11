import {
  StateEffect,
  StateField,
  RangeSet,
  RangeSetBuilder,
} from '@codemirror/state'
import {
  Decoration,
  EditorView,
  gutterLineClass,
  GutterMarker,
  ViewPlugin,
} from '@codemirror/view'

const activeCls = Decoration.line({
  attributes: { class: 'cm-context-active' },
})
const contextCls = Decoration.line({
  attributes: { class: 'cm-context' },
})
const topCls = Decoration.line({
  attributes: { class: 'cm-context-top' },
})
const bottomCls = Decoration.line({
  attributes: { class: 'cm-context-bottom' },
})

export const contextEffect = StateEffect.define({
  map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
})

export const contextState = StateField.define({
  create() {
    return {
      active: 1,
      first: 1,
      last: 1,
      filename: '',
      dispatch: () => {},
    }
  },

  update(value, transaction) {
    for (let e of transaction.effects) {
      if (e.is(contextEffect)) {
        value.active = e.value.active
        value.first = e.value.first
        value.last = e.value.last
        value.filename = e.value.filename
        value.dispatch = e.value.dispatch
      }
    }
    return value
  },
})

function contextPaint(view) {
  let { active, first, last } = view.state.field(contextState)
  let builder = new RangeSetBuilder()
  for (let { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      let line = view.state.doc.lineAt(pos)
      if (line.number >= first && line.number <= last) {
        builder.add(line.from, line.from, contextCls)
        if (line.number === first) {
          builder.add(line.from, line.from, topCls)
        }
        if (line.number === last) {
          builder.add(line.from, line.from, bottomCls)
        }
      }
      if (line.number === active) {
        builder.add(line.from, line.from, activeCls)
      }
      pos = line.to + 1
    }
  }
  return builder.finish()
}

export const showContext = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = contextPaint(view)
    }

    update(update) {
      this.decorations = contextPaint(update.view)
    }
  },
  {
    decorations: v => v.decorations,
  }
)

const activeLineMarker = new (class extends GutterMarker {
  elementClass = 'cm-gutter-active'
})()

const activeLineGutterHighlighter = gutterLineClass.compute(
  [contextState, 'doc'],
  state => {
    const active = state.field(contextState).active
    let marks = []
    if (state.doc.lines > active) {
      const linePos = state.doc.line(active)
      marks.push(activeLineMarker.range(linePos.from))
    }
    return RangeSet.of(marks)
  }
)

export function highlightActiveLineGutter() {
  return activeLineGutterHighlighter
}

export const lineWrappingHarder = EditorView.theme({
  '& .cm-lineWrapping': {
    wordBreak: 'break-all',
  },
})
