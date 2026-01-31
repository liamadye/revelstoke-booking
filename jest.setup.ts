import '@testing-library/jest-dom'
import React from 'react'

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        return React.createElement('img', props)
    },
}))
