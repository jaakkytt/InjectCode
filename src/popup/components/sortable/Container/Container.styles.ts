import React from 'react'

export function containerStyle(isOver: boolean): React.CSSProperties {
    return {
        transition: 'background-color 0.2s ease',
        backgroundColor: isOver ? 'rgba(34, 139, 230, 0.1)' : '#F3F4F6',
        padding: 8,
        border: '1px dashed #9CA3AF',
        borderRadius: 8,
        minHeight: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    }
}
