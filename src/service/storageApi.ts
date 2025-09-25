import { ItemsDataState } from '../types'

export interface StorageApi {
    get(key: string, defaultValue?: ItemsDataState): Promise<ItemsDataState>
    set(key: string, value: ItemsDataState): Promise<void>
    remove(key: string): Promise<void>
}

export class LocalStorageAPI implements StorageApi {
    async get(key: string, defaultValue?: ItemsDataState) {
        console.debug('LocalStorageAPI get', key)
        return JSON.parse(localStorage.getItem(key) ?? 'null') as ItemsDataState ?? defaultValue ?? {}
    }
    async set(key: string, value: ItemsDataState) {
        console.debug('LocalStorageAPI set', key, value)
        localStorage.setItem(key, JSON.stringify(value))
    }
    async remove(key: string) {
        console.debug('LocalStorageAPI remove', key)
        localStorage.removeItem(key)
    }
}

export class ChromeStorageAPI implements StorageApi {
    async get(key: string, defaultValue?: ItemsDataState) {
        console.debug('ChromeStorageAPI get', key)
        return chrome.storage.local.get({ [key]: defaultValue }).then(result => result[key] as ItemsDataState)
    }
    async set(key: string, value: ItemsDataState) {
        console.debug('ChromeStorageAPI set', key, value)
        return chrome.storage.local.set({ [key]: value })
    }
    async remove(key: string) {
        console.debug('ChromeStorageAPI remove', key)
        return chrome.storage.local.remove([key])
    }
}

export const storage: StorageApi = typeof chrome !== 'undefined' && chrome.storage ? new ChromeStorageAPI() : new LocalStorageAPI()
