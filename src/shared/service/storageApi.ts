import { ScriptsByPattern } from '../types'

export interface StorageApi {
    get(key: string, defaultValue?: ScriptsByPattern): Promise<ScriptsByPattern>
    set(key: string, value: ScriptsByPattern): Promise<void>
    remove(key: string): Promise<void>
    getValue<T>(key: string, defaultValue: T): Promise<T>
    setValue<T>(key: string, value: T): Promise<void>
}

export class LocalStorageAPI implements StorageApi {
    async get(key: string, defaultValue?: ScriptsByPattern) {
        console.debug('LocalStorageAPI get', key)
        return JSON.parse(localStorage.getItem(key) ?? 'null') as ScriptsByPattern ?? defaultValue ?? {}
    }
    async set(key: string, value: ScriptsByPattern) {
        console.debug('LocalStorageAPI set', key, value)
        localStorage.setItem(key, JSON.stringify(value))
    }
    async remove(key: string) {
        console.debug('LocalStorageAPI remove', key)
        localStorage.removeItem(key)
    }
    async getValue<T>(key: string, defaultValue: T) {
        console.debug('LocalStorageAPI getValue', key)
        const stored = localStorage.getItem(key)
        return stored === null ? defaultValue : JSON.parse(stored) as T
    }
    async setValue<T>(key: string, value: T) {
        console.debug('LocalStorageAPI setValue', key, value)
        localStorage.setItem(key, JSON.stringify(value))
    }
}

export class ChromeStorageAPI implements StorageApi {
    async get(key: string, defaultValue?: ScriptsByPattern) {
        return chrome.storage.local.get({ [key]: defaultValue }).then(result => result[key] as ScriptsByPattern)
    }
    async set(key: string, value: ScriptsByPattern) {
        return chrome.storage.local.set({ [key]: value })
    }
    async remove(key: string) {
        return chrome.storage.local.remove([key])
    }
    async getValue<T>(key: string, defaultValue: T) {
        return chrome.storage.local.get({ [key]: defaultValue }).then(result => result[key] as T)
    }
    async setValue<T>(key: string, value: T) {
        return chrome.storage.local.set({ [key]: value })
    }
}

export const storage: StorageApi = typeof chrome !== 'undefined' && chrome.storage
    ? new ChromeStorageAPI()
    : new LocalStorageAPI()
