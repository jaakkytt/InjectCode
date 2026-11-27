export const urlCharacterFilter = (input: string) => {
    const rfc3986ProhibitedChars = /[^a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]/g
    return input.replace(rfc3986ProhibitedChars, '')
}
