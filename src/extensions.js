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
  gutter,
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
        value = e.value
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
  [contextState, 'doc', 'selection'],
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

export const breakpointEffect = StateEffect.define({
  map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
})

export const breakpointState = StateField.define({
  create() {
    return RangeSet.empty
  },
  update(set, transaction) {
    set = set.map(transaction.changes)
    for (let e of transaction.effects) {
      if (e.is(breakpointEffect)) {
        if (e.value.on)
          set = set.update({ add: [breakpointMarker.range(e.value.pos)] })
        else set = set.update({ filter: from => from != e.value.pos })
      }
    }
    return set
  },
})

const breakpointMarker = new (class extends GutterMarker {
  toDOM() {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    circle.setAttribute('viewBox', '0 0 16 16')
    circle.setAttribute('width', '16')
    circle.setAttribute('height', '16')
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    c.setAttribute('cx', '8')
    c.setAttribute('cy', '8')
    c.setAttribute('r', '6')
    c.setAttribute('fill', 'currentColor')
    circle.appendChild(c)
    return circle
  }
})()

export const breakpointGutter = args => [
  breakpointState,
  gutter({
    class: 'cm-breakpoint-gutter',
    markers: v => v.state.field(breakpointState),
    initialSpacer: () => breakpointMarker,
    ...args,
  }),
]
