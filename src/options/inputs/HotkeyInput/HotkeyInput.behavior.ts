import React, { useState } from 'react'
import { formatHotkey, getKeysFromEvent, isModifierKey, normalizeKey } from 'prism-react-editor/commands'
import { useEditorSettings } from '../../providers/EditorSettingsProvider'
import { Props } from './HotkeyInput.types'

const CANCEL_KEY = normalizeKey('escape')
const PENDING_KEY = '…'

function modifierCode(event: React.KeyboardEvent): number {
    return Number(event.altKey) + Number(event.ctrlKey) * 2 + Number(event.metaKey) * 4 + Number(event.shiftKey) * 8
}

function movesFocus(event: React.KeyboardEvent): boolean {
    return event.key === 'Tab' && !event.ctrlKey && !event.altKey && !event.metaKey
}

export function useHotkeyInputBehavior({ command }: Props) {
    const { settings, changeHotkey } = useEditorSettings()
    const [heldModifiers, setHeldModifiers] = useState(0)

    function displayedHotkey(): string {
        if (!settings) {
            return ''
        }

        return formatHotkey(heldModifiers ? `${heldModifiers}+${PENDING_KEY}` : settings.hotkeys[command])
    }

    function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (movesFocus(event)) {
            return
        }

        if (isModifierKey(event.nativeEvent)) {
            setHeldModifiers(modifierCode(event))
            return
        }

        event.preventDefault()

        const [hotkey] = getKeysFromEvent(event.nativeEvent)
        if (hotkey !== CANCEL_KEY) {
            changeHotkey(command, hotkey)
        }

        event.currentTarget.blur()
    }

    return {
        value: displayedHotkey(),
        isDisabled: settings === null,
        handlers: {
            keyDown,
            blur: () => setHeldModifiers(0),
            keyUp: (event: React.KeyboardEvent<HTMLInputElement>) => setHeldModifiers(modifierCode(event)),
        },
    }
}
