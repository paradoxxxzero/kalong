import { RangeSetBuilder } from '@codemirror/rangeset'
import { Facet } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'

const contextLuminance = 0.2
const borderLuminance = 0.8
const activeLuminance = 0.5

const contextTheme = EditorView.baseTheme({
  '& .cm-context-top': {
    borderTop: `1px solid rgba(0, 0, 0, ${borderLuminance})`,
  },
  '& .cm-context-bottom': {
    borderBottom: `1px solid rgba(0, 0, 0, ${borderLuminance})`,
  },
  '& .cm-context': {
    backgroundColor: `rgba(0, 0, 0, ${contextLuminance})`,
    borderRight: `1px solid rgba(0, 0, 0, ${borderLuminance})`,
    borderLeft: `1px solid rgba(0, 0, 0, ${borderLuminance})`,
  },
  '& .cm-context-active': {
    backgroundColor: `rgba(0, 0, 0, ${activeLuminance})`,
  },
})

const contextFacet = Facet.define({
  combine: values => {
    return values.reduce(
      (acc, val) => ({
        active: val.active,
        first: Math.min(val.first, acc.first),
        last: Math.max(val.last, acc.last),
      }),
      {
        active: 0,
        first: Infinity,
        last: 0,
      }
    )
  },
})

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

function contextPaint(view) {
  let { active, first, last } = view.state.facet(contextFacet)
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

const showContext = ViewPlugin.fromClass(
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

export function context({ active, first, last }) {
  return [contextTheme, contextFacet.of({ active, first, last }), showContext]
}
