import { Interaction, InteractionListener } from './interaction.types'

export interface InteractionBus {
    publish(interaction: Interaction): void
    subscribe(listener: InteractionListener): () => void
}

export function createInteractionBus(): InteractionBus {
    const listeners = new Set<InteractionListener>()

    return {
        publish: (interaction) => listeners.forEach(listener => listener(interaction)),
        subscribe: (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
    }
}
