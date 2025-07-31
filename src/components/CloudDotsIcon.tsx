import React from 'react'

const CloudDotsIcon = ({ width = '24', height = '24', className = '' }) => {

    const cloudPath = 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96'
    const moreHorizPath = 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2'
    const translateY = 2.8

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={width}
            height={height}
            className={className}
        >
            <defs>
                <mask id="cloudCutoutMask">
                    <path d={cloudPath} fill="white" />
                    <path d={moreHorizPath} fill="black" transform={`translate(0, ${translateY})`} />
                </mask>
            </defs>
            <rect
                x="0"
                y="0"
                width="24"
                height="24"
                fill="currentColor"
                mask="url(#cloudCutoutMask)"
            />
        </svg>
    )
}

export default CloudDotsIcon
