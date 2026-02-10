import { tags } from '@lezer/highlight'
import { HighlightStyle } from '@codemirror/language'
import { syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'

const hsl = {
  light: {
    h: 230,
    s: '1%',
    l: '98%',
  },
  dark: {
    h: 220,
    s: '13%',
    l: '18%',
  },
}

const colors = {
  light: {
    mono1: `hsl(${hsl.light.h}, 8%, 24%)`,
    mono2: `hsl(${hsl.light.h}, 6%, 44%)`,
    mono3: `hsl(${hsl.light.h}, 4%, 64%)`,
    hue1: 'hsl(198, 99%, 37%)',
    hue2: 'hsl(221, 87%, 60%)',
    hue3: 'hsl(301, 63%, 40%)',
    hue4: 'hsl(119, 34%, 47%)',
    hue5: 'hsl(5, 74%, 59%)',
    hue5_2: 'hsl(344, 84%, 43%)',
    hue6: 'hsl(35, 99%, 36%)',
    hue6_2: 'hsl(35, 99%, 40%)',
    bg: `hsl(${hsl.light.h}, ${hsl.light.s}, ${hsl.light.l})`,
    accent: `hsl(${hsl.light.h}, 100%, 66%)`,
  },
  dark: {
    mono1: `hsl(${hsl.dark.h}, 14%, 71%)`,
    mono2: `hsl(${hsl.dark.h}, 9%, 55%)`,
    mono3: `hsl(${hsl.dark.h}, 10%, 40%)`,
    hue1: 'hsl(187, 47%, 55%)',
    hue2: 'hsl(207, 82%, 66%)',
    hue3: 'hsl(286, 60%, 67%)',
    hue4: 'hsl( 95, 38%, 62%)',
    hue5: 'hsl(355, 65%, 65%)',
    hue5_2: 'hsl(5, 48%, 51%)',
    hue6: 'hsl(29, 54%, 61%)',
    hue6_2: 'hsl(39, 67%, 69%)',
    bg: `hsl(${hsl.dark.h}, ${hsl.dark.s}, ${hsl.dark.l})`,
    accent: `hsl(${hsl.dark.h}, 100%, 66%)`,
  },
}

const style = ({
  mono1,
  mono2,
  hue1,
  hue2,
  hue3,
  hue4,
  hue5,
  hue6,
  hue6_2,
  accent,
}) =>
  HighlightStyle.define([
    { tag: tags.keyword, color: hue3 },
    {
      tag: [
        // tags.name,
        tags.deleted,
        tags.character,
        tags.propertyName,
        tags.macroName,
      ],
      color: hue1,
    },
    {
      tag: [tags.function(tags.variableName), tags.labelName],
      color: hue2,
    },
    {
      tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
      color: hue6,
    },
    {
      tag: [tags.definition(tags.name), tags.separator],
      color: mono1,
    },
    {
      tag: [
        tags.typeName,
        tags.className,
        tags.number,
        tags.changed,
        tags.annotation,
        tags.modifier,
        tags.self,
        tags.namespace,
      ],
      color: hue6_2,
    },
    {
      tag: [
        tags.operator,
        tags.operatorKeyword,
        tags.url,
        tags.escape,
        tags.regexp,
        tags.link,
        tags.special(tags.string),
      ],
      color: hue1,
    },
    { tag: [tags.meta, tags.comment], color: mono2 },
    { tag: tags.strong, fontWeight: 'bold' },
    { tag: tags.emphasis, fontStyle: 'italic' },
    { tag: tags.strikethrough, textDecoration: 'line-through' },
    { tag: tags.link, color: mono2, textDecoration: 'underline' },
    { tag: tags.heading, fontWeight: 'bold', color: hue5 },
    {
      tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
      color: hue6,
    },
    {
      tag: [tags.processingInstruction, tags.string, tags.inserted],
      color: hue4,
    },
    { tag: tags.invalid, color: accent },
  ])

const editorTheme = ({ mono1, mono2, accent }, muiTheme) =>
  EditorView.theme(
    {
      '&': {
        color: mono1,
        fontFamily: '"Fira Code", monospace',
        // backgroundColor: muiTheme.vars.palette.background.paper,
        backgroundImage: muiTheme.vars.overlays[0],
        boxShadow: muiTheme.vars.shadows[0],
      },
      '.cm-content': {
        caretColor: accent,
      },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: accent },
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: muiTheme.alpha(
            muiTheme.vars.palette.primary.main,
            0.3
          ),
        },
      '.cm-panels': {
        backgroundColor: muiTheme.vars.palette.background.paper,
        backgroundImage: muiTheme.vars.overlays[3],
        boxShadow: muiTheme.vars.shadows[3],
        color: mono1,
      },
      '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
      '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },
      '.cm-searchMatch': {
        backgroundColor: '#72a1ff59',
        outline: '1px solid #457dff',
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: '#6199ff2f',
      },
      '.cm-activeLine': { backgroundColor: '#6699ff0b' },
      '.cm-selectionMatch': { backgroundColor: '#aafe661a' },
      '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
        backgroundColor: '#bad0f847',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        color: mono2,
        border: 'none',
      },
      '.cm-activeLineGutter': {
        backgroundColor: muiTheme.vars.palette.background.paper,
        backgroundImage: muiTheme.vars.overlays[1],
        boxShadow: muiTheme.vars.shadows[1],
      },
      '.cm-foldPlaceholder': {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ddd',
      },
      '.cm-tooltip': {
        border: 'none',
        color: mono1,
        backgroundColor: muiTheme.vars.palette.background.paper,
        backgroundImage: muiTheme.vars.overlays[2],
        boxShadow: muiTheme.vars.shadows[2],
      },

      '.cm-tooltip-autocomplete': {
        '& > ul > li[aria-selected]': {
          background: 'none',
          backgroundColor: muiTheme.alpha(
            muiTheme.vars.palette.primary.main,
            0.25
          ),
          color: mono1,
        },
      },
      '& .cm-context-top': {
        borderTop: `1px solid ${muiTheme.alpha(muiTheme.vars.palette.primary.main, 0.125)}`,
      },
      '& .cm-context-bottom': {
        borderBottom: `1px solid ${muiTheme.alpha(muiTheme.vars.palette.primary.main, 0.125)}`,
      },
      '& .cm-context': {
        backgroundColor: muiTheme.alpha(
          muiTheme.vars.palette.primary.main,
          0.03
        ),
        borderRight: `1px solid ${muiTheme.alpha(muiTheme.vars.palette.primary.main, 0.125)}`,
        borderLeft: `1px solid ${muiTheme.alpha(muiTheme.vars.palette.primary.main, 0.125)}`,
      },
      '& .cm-context-active': {
        backgroundColor: muiTheme.alpha(
          muiTheme.vars.palette.primary.main,
          0.1
        ),
        border: `1px solid ${muiTheme.alpha(muiTheme.vars.palette.primary.main, 0.1)}`,
      },
      '.cm-debuggerActiveLine': {
        backgroundColor: muiTheme.alpha(
          muiTheme.vars.palette.primary.main,
          0.5
        ),
        color: muiTheme.vars.palette.background.paper,
      },
    },
    { dark: true }
  )

const styles = {
  light: style(colors.light),
  dark: style(colors.dark),
}
export const cmTheme = (colorScheme, muiTheme) => {
  return [
    editorTheme(colors[colorScheme], muiTheme),
    syntaxHighlighting(styles[colorScheme]),
  ]
}

export const cmHighlight = colorScheme => styles[colorScheme]
