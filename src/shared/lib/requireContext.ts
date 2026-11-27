export function requireContext<T>(value: T | undefined, providerName: string): T {
    if (value === undefined) {
        throw new Error(`Missing <${providerName}> above this component`)
    }

    return value
}
