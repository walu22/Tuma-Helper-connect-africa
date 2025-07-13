import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Auth from '@/pages/Auth'
import { AuthProvider } from '@/hooks/useAuth'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

// Mock the supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    signInWithOAuth: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }))
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
  })

  it('should render the login form by default', async () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    )

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to Tuma Helper')).toBeInTheDocument()
    })

    // Check that sign in tab is active by default
    expect(screen.getByRole('tab', { name: 'Sign In' })).toHaveAttribute('data-state', 'active')
    
    // Check sign in form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should switch to the signup form when the "Sign Up" tab is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    )

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to Tuma Helper')).toBeInTheDocument()
    })

    // Click on the Sign Up tab
    const signUpTab = screen.getByRole('tab', { name: 'Sign Up' })
    await user.click(signUpTab)

    // Wait for the signup form to appear
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Sign Up' })).toHaveAttribute('data-state', 'active')
    })

    // Check signup form elements are present
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/i want to/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should allow a user to sign up successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful signup
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    })

    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    )

    // Wait for component to load and switch to signup tab
    await waitFor(() => {
      expect(screen.getByText('Welcome to Tuma Helper')).toBeInTheDocument()
    })

    const signUpTab = screen.getByRole('tab', { name: 'Sign Up' })
    await user.click(signUpTab)

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })

    // Fill out the signup form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')

    // Submit the form
    const createAccountButton = screen.getByRole('button', { name: /create account/i })
    await user.click(createAccountButton)

    // Wait for the signup function to be called
    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('localhost'),
          data: {
            full_name: 'John Doe',
            phone: '',
            role: 'customer',
            city: 'Windhoek',
          }
        }
      })
    })
  })

  it('should handle signup validation errors', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    )

    // Wait for component to load and switch to signup tab
    await waitFor(() => {
      expect(screen.getByText('Welcome to Tuma Helper')).toBeInTheDocument()
    })

    const signUpTab = screen.getByRole('tab', { name: 'Sign Up' })
    await user.click(signUpTab)

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })

    // Fill out form with mismatched passwords
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different')

    // Submit the form
    const createAccountButton = screen.getByRole('button', { name: /create account/i })
    await user.click(createAccountButton)

    // Check that the signup function was not called due to validation error
    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('should handle sign in', async () => {
    const user = userEvent.setup()
    
    // Mock successful sign in
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    })

    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    )

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to Tuma Helper')).toBeInTheDocument()
    })

    // Fill out sign in form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    // Submit the form
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    // Wait for the signin function to be called
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should show forgot password form when link is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    )

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to Tuma Helper')).toBeInTheDocument()
    })

    // Click forgot password link
    const forgotPasswordLink = screen.getByRole('button', { name: /forgot your password/i })
    await user.click(forgotPasswordLink)

    // Check that forgot password form appears
    await waitFor(() => {
      expect(screen.getByText(/reset your password/i)).toBeInTheDocument()
    })
  })
})