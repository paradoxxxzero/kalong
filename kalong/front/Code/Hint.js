import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'
import { useContext, useEffect } from 'react'

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
  return null
}
