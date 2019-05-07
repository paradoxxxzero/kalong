import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'
import React from 'react'

export default class Hint extends React.PureComponent {
  componentDidMount() {
    this.componentDidUpdate({})
  }

  componentDidUpdate({
    hint: oldHint,
    completeSingle: oldCompleteSingle,
    alignWithWord: oldAlignWithWord,
    closeCharacters: oldCloseCharacters,
    closeOnUnfocus: oldCloseOnUnfocus,
    completeOnSingleClick: oldCompleteOnSingleClick,
    container: oldContainer,
    customKeys: oldCustomKeys,
    extraKeys: oldExtraKeys,
  }) {
    const {
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
    } = this.props
    if (
      hint !== oldHint ||
      completeSingle !== oldCompleteSingle ||
      alignWithWord !== oldAlignWithWord ||
      closeCharacters !== oldCloseCharacters ||
      closeOnUnfocus !== oldCloseOnUnfocus ||
      completeOnSingleClick !== oldCompleteOnSingleClick ||
      container !== oldContainer ||
      customKeys !== oldCustomKeys ||
      extraKeys !== oldExtraKeys
    ) {
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
    }
  }

  componentWillUnmount() {
    const { codeMirror } = this.props
    codeMirror.closeHint()
  }

  render() {
    return null
  }
}
