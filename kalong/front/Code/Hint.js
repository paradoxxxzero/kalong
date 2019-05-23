import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'
import { useContext, useEffect, useLayoutEffect } from 'react'

import { CodeContext } from '.'

export default function Hint({
  hint,
  completeSingle,
  alignWithWord,
  closeCharacters,
  closeOnUnfocus,
  completeOnSingleClick,
  container,
  customKeys,
  extraKeys,
  onStartCompletion,
  onEndCompletion,
}) {
  const codeMirror = useContext(CodeContext)
  useEffect(
    () => {
      codeMirror.showHint({
        hint,
        completeSingle,
        alignWithWord,
        closeCharacters,
        closeOnUnfocus,
        completeOnSingleClick,
        container,
        customKeys,
        extraKeys,
      })
      return () => {
        codeMirror.closeHint()
      }
    },
    [
      codeMirror,
      hint,
      completeSingle,
      alignWithWord,
      closeCharacters,
      closeOnUnfocus,
      completeOnSingleClick,
      container,
      customKeys,
      extraKeys,
    ]
  )
  useLayoutEffect(
    () => {
      if (!onStartCompletion) {
        return
      }
      codeMirror.on('startCompletion', onStartCompletion)
      return () => codeMirror.off('startCompletion', onStartCompletion)
    },
    [codeMirror, onStartCompletion]
  )
  useLayoutEffect(
    () => {
      if (!onEndCompletion) {
        return
      }
      codeMirror.on('endCompletion', onEndCompletion)
      return () => codeMirror.off('endCompletion', onEndCompletion)
    },
    [codeMirror, onEndCompletion]
  )
  return null
}
