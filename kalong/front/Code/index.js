import React, { useRef, useLayoutEffect, useState } from 'react'

import CodeMirror from './codemirror'

export const CodeContext = React.createContext({
  codeMirror: null,
})

const useOption = (codeMirror, option) => {
  const [[name, value]] = Object.entries(option)
  useLayoutEffect(
    () => {
      if (!codeMirror) {
        return
      }
      if (value !== void 0) {
        codeMirror.setOption(name, value)
      }
    },
    [codeMirror, name, value]
  )
}

const useEvent = (codeMirror, event) => {
  const [[name, handler]] = Object.entries(event)
  const eventName = name.replace(/^on/, '').replace(/^\w/, c => c.toUpperCase())
  useLayoutEffect(
    () => {
      if (!codeMirror) {
        return
      }
      if (handler !== void 0) {
        codeMirror.on(eventName, handler)
      }
      return () => {
        if (handler !== void 0) {
          codeMirror.off(eventName, handler)
        }
      }
    },
    [codeMirror, eventName, handler]
  )
}

function Code(
  {
    className,
    width,
    height,
    onChange,
    children,
    // All options
    value,
    mode,
    indentUnit,
    indentWithTabs,
    smartIndent,
    tabSize,
    lineSeparator,
    specialChars,
    specialCharPlaceholder,
    electricChars,
    inputStyle,
    spellcheck,
    autocorrect,
    autocapitalize,
    rtlMoveVisually,
    wholeLineUpdateBefore,
    theme,
    keyMap,
    extraKeys,
    configureMouse,
    lineWrapping,
    gutters,
    fixedGutter,
    coverGutterNextToScrollbar,
    scrollbarStyle,
    lineNumbers,
    firstLineNumber,
    lineNumberFormatter,
    showCursorWhenSelecting,
    resetSelectionOnContextMenu,
    lineWiseCopyCut,
    pasteLinesPerSelection,
    selectionsMayTouch,
    readOnly,
    disableInput,
    dragDrop,
    allowDropFileTypes,
    cursorBlinkRate,
    cursorScrollMargin,
    cursorHeight,
    singleCursorHeightPerLine,
    workTime,
    workDelay,
    flattenSpans,
    addModeClass,
    pollInterval,
    undoDepth,
    historyEventDelay,
    viewportMargin,
    maxHighlightLength,
    moveInputWithCursor,
    tabindex,
    autofocus,
    direction,
    phrases,
    // Events
    onChanges,
    onBeforeChange,
    onCursorActivity,
    onKeyHandled,
    onInputRead,
    onElectricInput,
    onBeforeSelectionChange,
    onViewportChange,
    onSwapDoc,
    onGutterClick,
    onGutterContextMenu,
    onFocus,
    onBlur,
    onScroll,
    onRefresh,
    onOptionChange,
    onScrollCursorIntoView,
    onUpdate,
    onRenderLine,
    onMousedown,
    onDblclick,
    onTouchstart,
    onContextmenu,
    onKeydown,
    onKeypress,
    onKeyup,
    onCut,
    onCopy,
    onPaste,
    onDragstart,
    onDragenter,
    onDragover,
    onDragleave,
    onDrop,
  },
  codeMirrorRef
) {
  theme = theme || 'default'
  mode = mode || 'python'

  const root = useRef()
  const [codeMirror, setCodeMirror] = useState(null)

  useLayoutEffect(
    () => {
      const cm = CodeMirror(root.current)
      if (codeMirrorRef) {
        codeMirrorRef.current = cm
      }
      setCodeMirror(cm)
    },
    [codeMirrorRef]
  )

  useLayoutEffect(
    () => {
      if (!codeMirror) {
        return
      }
      const handleChange = (cm, change) => {
        const newValue = cm.getValue()
        if (newValue !== value) {
          onChange && onChange(newValue, change)
        }
      }
      codeMirror.on('change', handleChange)
      return () => codeMirror.off('change', handleChange)
    },
    [codeMirror, value, onChange]
  )

  useLayoutEffect(
    () => {
      if (!codeMirror || value === void 0 || value === codeMirror.getValue()) {
        return
      }
      codeMirror.setValue(value || '')
      codeMirror.setCursor({
        line: codeMirror.lastLine(),
        ch: codeMirror.getLine(codeMirror.lastLine()).length,
      })
      return () => {
        codeMirror.setValue('')
      }
    },
    [codeMirror, value]
  )

  useLayoutEffect(
    () => {
      if (!codeMirror) {
        return
      }
      codeMirror.setSize(width, height)
      codeMirror.refresh()
    },
    [codeMirror, width, height]
  )

  // This is gore but at least it's not a hack
  useOption(codeMirror, { mode })
  useOption(codeMirror, { indentUnit })
  useOption(codeMirror, { indentWithTabs })
  useOption(codeMirror, { smartIndent })
  useOption(codeMirror, { tabSize })
  useOption(codeMirror, { lineSeparator })
  useOption(codeMirror, { specialChars })
  useOption(codeMirror, { specialCharPlaceholder })
  useOption(codeMirror, { electricChars })
  useOption(codeMirror, { inputStyle })
  useOption(codeMirror, { spellcheck })
  useOption(codeMirror, { autocorrect })
  useOption(codeMirror, { autocapitalize })
  useOption(codeMirror, { rtlMoveVisually })
  useOption(codeMirror, { wholeLineUpdateBefore })
  useOption(codeMirror, { theme })
  useOption(codeMirror, { keyMap })
  useOption(codeMirror, { extraKeys })
  useOption(codeMirror, { configureMouse })
  useOption(codeMirror, { lineWrapping })
  useOption(codeMirror, { gutters })
  useOption(codeMirror, { fixedGutter })
  useOption(codeMirror, { coverGutterNextToScrollbar })
  useOption(codeMirror, { scrollbarStyle })
  useOption(codeMirror, { lineNumbers })
  useOption(codeMirror, { firstLineNumber })
  useOption(codeMirror, { lineNumberFormatter })
  useOption(codeMirror, { showCursorWhenSelecting })
  useOption(codeMirror, { resetSelectionOnContextMenu })
  useOption(codeMirror, { lineWiseCopyCut })
  useOption(codeMirror, { pasteLinesPerSelection })
  useOption(codeMirror, { selectionsMayTouch })
  useOption(codeMirror, { readOnly })
  useOption(codeMirror, { disableInput })
  useOption(codeMirror, { dragDrop })
  useOption(codeMirror, { allowDropFileTypes })
  useOption(codeMirror, { cursorBlinkRate })
  useOption(codeMirror, { cursorScrollMargin })
  useOption(codeMirror, { cursorHeight })
  useOption(codeMirror, { singleCursorHeightPerLine })
  useOption(codeMirror, { workTime })
  useOption(codeMirror, { workDelay })
  useOption(codeMirror, { flattenSpans })
  useOption(codeMirror, { addModeClass })
  useOption(codeMirror, { pollInterval })
  useOption(codeMirror, { undoDepth })
  useOption(codeMirror, { historyEventDelay })
  useOption(codeMirror, { viewportMargin })
  useOption(codeMirror, { maxHighlightLength })
  useOption(codeMirror, { moveInputWithCursor })
  useOption(codeMirror, { tabindex })
  useOption(codeMirror, { autofocus })
  useOption(codeMirror, { direction })
  useOption(codeMirror, { phrases })

  useEvent(codeMirror, { onChanges })
  useEvent(codeMirror, { onBeforeChange })
  useEvent(codeMirror, { onCursorActivity })
  useEvent(codeMirror, { onKeyHandled })
  useEvent(codeMirror, { onInputRead })
  useEvent(codeMirror, { onElectricInput })
  useEvent(codeMirror, { onBeforeSelectionChange })
  useEvent(codeMirror, { onViewportChange })
  useEvent(codeMirror, { onSwapDoc })
  useEvent(codeMirror, { onGutterClick })
  useEvent(codeMirror, { onGutterContextMenu })
  useEvent(codeMirror, { onFocus })
  useEvent(codeMirror, { onBlur })
  useEvent(codeMirror, { onScroll })
  useEvent(codeMirror, { onRefresh })
  useEvent(codeMirror, { onOptionChange })
  useEvent(codeMirror, { onScrollCursorIntoView })
  useEvent(codeMirror, { onUpdate })
  useEvent(codeMirror, { onRenderLine })
  useEvent(codeMirror, { onMousedown })
  useEvent(codeMirror, { onDblclick })
  useEvent(codeMirror, { onTouchstart })
  useEvent(codeMirror, { onContextmenu })
  useEvent(codeMirror, { onKeydown })
  useEvent(codeMirror, { onKeypress })
  useEvent(codeMirror, { onKeyup })
  useEvent(codeMirror, { onCut })
  useEvent(codeMirror, { onCopy })
  useEvent(codeMirror, { onPaste })
  useEvent(codeMirror, { onDragstart })
  useEvent(codeMirror, { onDragenter })
  useEvent(codeMirror, { onDragover })
  useEvent(codeMirror, { onDragleave })
  useEvent(codeMirror, { onDrop })

  useLayoutEffect(() => {
    if (codeMirror && autofocus) {
      codeMirror.focus()
    }
  })

  return (
    <div ref={root} className={className}>
      {codeMirror && (
        <CodeContext.Provider value={codeMirror}>
          {children}
        </CodeContext.Provider>
      )}
    </div>
  )
}

export default React.forwardRef(Code)
