import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import Header from '../Header'

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}))

// Mock the LanguageContext
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}))

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the logo and navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('LocalServe')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /localserve/i })).toBeInTheDocument()
  })

  it('shows sign in button when user is not authenticated', () => {
    render(<Header />)
    
    expect(screen.getByText('nav.signIn')).toBeInTheDocument()
  })

  it('renders mobile menu button', () => {
    render(<Header />)
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
    expect(mobileMenuButton).toBeInTheDocument()
  })

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />)
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(mobileMenuButton)
    
    // Check if mobile menu items are visible
    expect(screen.getAllByText('nav.services')).toHaveLength(2) // One for desktop, one for mobile
  })
})