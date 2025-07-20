import React, { useState } from 'react'

import DraggableAccordion from './sortable/DraggableAccordion'
import { AccordionItemData } from './sortable/types'

export default function UserScripts() {

    const [items, setItems] = useState<Record<string, AccordionItemData[]>>({
        '<all_urls>': [
            {
                id: 'panel1',
                title: 'General settings',
                secondaryText: '',
                content: 'Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat. Aliquam eget maximus est, id dignissim quam.',
                active: true,
            },
            {
                id: 'panel2',
                title: 'Users',
                secondaryText: '',
                content: 'Donec placerat, lectus sed mattis semper, neque lectus feugiat lectus, varius pulvinar diam eros in elit. Pellentesque convallis laoreet laoreet.',
                active: false,
            },
            {
                id: 'panel3',
                title: 'Advanced settings',
                secondaryText: '',
                content: 'Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas augue. Duis vel est augue.',
                active: true,
            },
            {
                id: 'panel4',
                title: 'Personal data and a very long title which will most likely stretch this accordion item to the next line',
                secondaryText: '',
                content: 'Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas augue. Duis vel est augue.',
                active: true,
            },
        ],
        'https://github.com/*': [],
        'https://github.com/jaakkytt/*': [],
    })

    const addContainer = () => {
        const newContainerId = `container${Object.keys(items).length + 1}`
        setItems((prev) => ({
            ...prev,
            [newContainerId]: [],
        }))
    }

    const addItem = () => {
        const newItemId = `item${Math.random().toString(36).substring(2, 15)}`
        setItems((prev) => {
            const firstContainerKey = Object.keys(prev)[0]
            return {
                ...prev,
                [firstContainerKey]: [...prev[firstContainerKey], {
                    id: newItemId,
                    title: 'New entry' + newItemId,
                    secondaryText: '',
                    content: 'Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros, vitae egestas augue. Duis vel est augue.',
                    active: true,
                }],
            }
        })
    }

    const onUpdateItem = (id: string, changes: Partial<AccordionItemData>) => {
        setItems((prevState) =>
            Object.fromEntries(
                Object.entries(prevState).map(([containerId, children]) => [
                    containerId,
                    children.map((item) => (item.id === id ? { ...item, ...changes } : item)),
                ]),
            ),
        )
    }

    return (
        <>
            <button onClick={addContainer}>New URL</button>
            <button onClick={addItem}>New Script</button>
            <DraggableAccordion items={items} setItems={setItems} onUpdateItem={onUpdateItem} />
        </>
    )
}
