export function createFakeLocalStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
    const values = new Map<string, string>()

    return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
            values.set(key, value)
        },
        removeItem: (key: string) => {
            values.delete(key)
        },
    }
}
