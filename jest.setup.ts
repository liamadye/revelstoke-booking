/**
 * Jest setup file for the test environment.
 * This file is executed before each test and is used to configure
 * global mocks and testing-library extensions.
 */
import '@testing-library/jest-dom'
import React from 'react'

// Mock next/image to handle it in a testing environment without a Next.js server
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return React.createElement('img', props)
    },
}))
