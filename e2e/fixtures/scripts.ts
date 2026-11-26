import { SHARED_CODE } from '../../src/shared/constants'
import type { Script, ScriptsByPattern, ScriptType } from '../../src/shared/types'

export const SITE_A = '*://a.example/*'
export const SITE_A_PAGE = '*://a.example/page*'
export const SITE_B = '*://b.example/*'
export const SITE_C = '*://c.example/*'
export const SHARED = SHARED_CODE

export const TAB_A = { id: 7, url: 'https://a.example/page' }
export const TAB_A2 = { id: 8, url: 'https://a.example/other' }
export const TAB_C = { id: 9, url: 'https://c.example/' }

const LONG_SCRIPT_LINES = 200
const FILLER_SCRIPTS = 7

export const SCRIPTS: ScriptsByPattern = {
    [SHARED]: [
        script('js-sigma', 'Sigma', 'js', 'console.log("sigma")'),
        script('js-tau', 'Tau', 'js', 'console.log("tau")'),
        script('js-upsilon', 'Upsilon', 'js', 'console.log("upsilon")'),
        script('css-phi', 'Phi', 'css', 'body { color: green }'),
    ],
    [SITE_A]: [
        script('js-alpha', 'Alpha', 'js', 'console.log("alpha")'),
        script('js-beta', 'Beta', 'js', longContent()),
        script('css-gamma', 'Gamma', 'css', 'body { color: red }'),
        ...fillerScripts(),
    ],
    [SITE_A_PAGE]: [
        script('js-iota', 'Iota', 'js', 'console.log("iota")'),
        script('js-kappa', 'Kappa', 'js', 'console.log("kappa")'),
    ],
    [SITE_B]: [
        script('js-delta', 'Delta', 'js', 'console.log("delta")'),
        script('js-epsilon', 'Epsilon', 'js', 'console.log("epsilon")'),
    ],
    [SITE_C]: [
        script('js-zeta', 'Zeta', 'js', 'console.log("zeta")'),
        script('js-eta', 'Eta', 'js', 'console.log("eta")'),
        script('css-theta', 'Theta', 'css', 'body { color: blue }'),
    ],
}

function script(id: string, title: string, type: ScriptType, content: string): Script {
    return { id, title, secondaryText: '', content, runMode: 'active', type }
}

function fillerScripts(): Script[] {
    return Array.from({ length: FILLER_SCRIPTS }, (_, index) =>
        script(`js-filler-${index + 1}`, `Filler ${index + 1}`, 'js', `console.log(${index + 1})`),
    )
}

function longContent(): string {
    return Array.from({ length: LONG_SCRIPT_LINES }, (_, index) => `console.log('line ${index + 1}')`).join('\n')
}
