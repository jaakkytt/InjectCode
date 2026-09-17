import { useExistingUrls } from '../../../providers/ExistingUrlsProvider'
import { urlPatternValidator } from '../../../service/urlPatternValidator'
import { urlCharacterFilter } from '../../../service/urlCharacterFilter'
import { usePlayControls } from '../../usePlayControls'
import { Props } from './AccordionItem.types'

export function useAccordionItemBehavior(
    { containerId, items, onRename }: Pick<Props, 'containerId' | 'items' | 'onRename'>,
) {
    const existingUrls = useExistingUrls()
    const play = usePlayControls({ [containerId]: items })

    return {
        play,
        transformTitleInput: urlCharacterFilter,
        handlers: {
            handleTitleChange: (newKey: string) => onRename(newKey),
            validateTitle: (value: string) => urlPatternValidator(value, existingUrls),
        },
    }
}
