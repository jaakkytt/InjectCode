import { useExistingUrls } from '../../../providers/ExistingUrlsProvider'
import { urlPatternValidator } from '../../../../shared/service/urlPatternValidator'
import { urlCharacterFilter } from '../../../service/urlCharacterFilter'
import { usePlayControls } from '../../../hooks/usePlayControls'
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
            titleChange: (newKey: string) => onRename(newKey),
            validateTitle: (value: string) => urlPatternValidator(value, existingUrls),
        },
    }
}
