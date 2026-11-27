import GlobalStyles from '@mui/material/GlobalStyles'
import React, { ReactNode } from 'react'
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles'

import { LOCAL_STORAGE_COLOR_MODE } from '../constants'

interface ColorModeProviderProps {
    children: ReactNode
}

const theme = createTheme({
    colorSchemes: {
        light: { palette: { background: { default: '#f4f4f4' } } },
        dark: true,
    },
})

const pageStyles = ({ palette }: Theme) => ({
    html: { colorScheme: palette.mode },
    body: { backgroundColor: palette.background.default, color: palette.text.primary },
})

export const ColorModeProvider = ({ children }: ColorModeProviderProps) => (
    <ThemeProvider theme={theme} defaultMode="light" modeStorageKey={LOCAL_STORAGE_COLOR_MODE} noSsr>
        <GlobalStyles styles={pageStyles} />
        {children}
    </ThemeProvider>
)
