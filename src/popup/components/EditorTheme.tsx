import GlobalStyles from '@mui/material/GlobalStyles'
import { Theme } from '@mui/material/styles'
import githubDark from 'prism-react-editor/themes/github-dark.css'
import githubLight from 'prism-react-editor/themes/github-light.css'
import React from 'react'

const editorThemeStyles = ({ palette }: Theme) => palette.mode === 'dark' ? githubDark : githubLight

const EditorTheme = () => <GlobalStyles styles={editorThemeStyles} />

export default EditorTheme
