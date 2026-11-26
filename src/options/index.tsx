import React from 'react'
import { createRoot } from 'react-dom/client'

import '../shared/styles/global.css'
import { ColorModeProvider } from '../shared/providers/ColorModeProvider'
import Options from './Options'

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
    <ColorModeProvider>
        <Options />
    </ColorModeProvider>,
)
