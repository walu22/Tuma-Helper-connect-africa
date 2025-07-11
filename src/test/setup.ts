import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb: any) {
    this.cb = cb;
  }
  cb: any;
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []
  
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

global.IntersectionObserver = MockIntersectionObserver as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})