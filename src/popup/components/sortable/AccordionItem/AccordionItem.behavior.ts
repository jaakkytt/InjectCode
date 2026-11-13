import { useExistingUrls } from '../../../providers/ExistingUrlsProvider'
import { urlPatternValidator } from '../../../../shared/service/urlPatternValidator'
import { urlCharacterFilter } from '../../../service/urlCharacterFilter'
import { usePlayControls } from '../../../hooks/usePlayControls'
import { useRestoreAnchor } from '../../../hooks/useRestoreAnchor'
import { Props } from './AccordionItem.types'

export function useAccordionItemBehavior(
    { containerId, items, onRename }: Pick<Props, 'containerId' | 'items' | 'onRename'>,
) {
    const existingUrls = useExistingUrls()
    const play = usePlayControls({ [containerId]: items })
    const restoreAnchorRef = useRestoreAnchor('urlBlock', containerId)

    return {
        play,
        restoreAnchorRef,
        transformTitleInput: urlCharacterFilter,
        handlers: {
            titleChange: (newKey: string) => onRename(newKey),
            validateTitle: (value: string) => urlPatternValidator(value, existingUrls),
        },
    }
}
