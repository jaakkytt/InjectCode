import React, { useEffect, useState } from 'react'

const USER_SCRIPT_ID = 'default'

const isUserScriptsAvailable = async () => {
    try {
        return await chrome.userScripts.getScripts().then(() => true)
    } catch {
        return false
    }
}

const Options = () => {
    const [type, setType] = useState('custom')
    const [script, setScript] = useState('alert(\'hi\');')
    const [userScriptsAvailable, setUserScriptsAvailable] = useState(true)

    useEffect(() => {
        if (!isUserScriptsAvailable()) {
            setUserScriptsAvailable(false)
            console.error('User Scripts API is not available. Please enable developer mode.')
            return
        }

        const init = async () => {
            const { storedType, storedScript } = await chrome.storage.local.get({
                type: 'custom',
                script: 'alert(\'hi\');',
            })

            setType(storedType)
            setScript(storedScript)
        }

        init()

        const handleStorageChange = () => init()
        chrome.storage.local.onChanged.addListener(handleStorageChange)
        return () => chrome.storage.local.onChanged.removeListener(handleStorageChange)
    }, [])

    const onSave = async () => {
        if (!userScriptsAvailable) return

        await chrome.storage.local.set({ type, script })

        const existingScripts = await chrome.userScripts.getScripts({ ids: [USER_SCRIPT_ID] })

        const newScript = {
            id: USER_SCRIPT_ID,
            matches: ['<all_urls>'],
            js: type === 'file' ? [{ file: '../js/user-script.js' }] : [{ code: script }],
        }

        if (existingScripts.length > 0) {
            await chrome.userScripts.update([newScript])
        } else {
            await chrome.userScripts.register([newScript])
        }

        console.log('Script saved and registered/updated.')
    }

    return <>
        <div id="warning">
            <p>
                ⚠️ To use the User Scripts API, you need to first enable developer mode
                at <b>chrome://extensions</b>.
            </p>
            <a href="">Reload</a>
        </div>
        <form id="settings-form">
            <h1>Settings</h1>
            <h2>Type</h2>
            <label>
                <input
                    type="radio"
                    name="type"
                    value="file"
                    checked={type === 'file'}
                    onChange={() => setType('file')}
                />
                <span>File</span>
            </label>
            <label>
                <input
                    type="radio"
                    name="type"
                    value="custom"
                    checked={type === 'custom'}
                    onChange={() => setType('custom')}
                />
                <span>Custom text</span>
            </label>
            {type === 'custom' && (
                <div id="custom-script-wrapper">
                    <h2>Custom script</h2>
                    <textarea
                        name="custom-script"
                        className="code"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        draggable="false"
                        placeholder="alert('hi');"
                    />
                </div>
            )}
            <button type="button" id="save-button" onClick={onSave}>Save & Enable</button>
        </form>
        <div>
            <h1>Help</h1>
            <p>
                URL patterns must match the format defined in <a target="_blank" href="https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns">Chrome Extensions docs</a>.
            </p>
            <p>TODO: note about file urls being needing a toggle in settings.</p>
        </div>
    </>
}

export default Options
