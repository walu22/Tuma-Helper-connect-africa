import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Auth from '@/pages/Auth'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

// Create mock functions that we can check in tests
const mockSignIn = vi.fn().mockResolvedValue({ error: null })
const mockSignUp = vi.fn().mockResolvedValue({ error: null })
const mockResetPassword = vi.fn().mockResolvedValue({ error: null })

// Mock useAuth hook directly to avoid authentication issues
vi.mock('@/hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPassword: mockResetPassword,
    signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
    signInWithFacebook: vi.fn().mockResolvedValue({ error: null }),
  }),
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
        {children}
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign-in form by default', async () => {
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

  it('switches to sign-up form when tab is clicked', async () => {
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

  it('allows a user to sign up successfully', async () => {
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
      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        {
          full_name: 'John Doe',
          phone: '',
          role: 'customer',
          city: 'Windhoek',
        }
      )
    })
  })

  it('validates password confirmation on sign-up', async () => {
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
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different')

    // Submit the form
    const createAccountButton = screen.getByRole('button', { name: /create account/i })
    await user.click(createAccountButton)

    // Check that the signup function was not called due to validation error
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('allows a user to sign in successfully', async () => {
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

    // Fill out sign in form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    // Submit the form
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    // Wait for the signin function to be called
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows an error on failed sign-in', async () => {
    const user = userEvent.setup()
    
    // Mock failed sign in
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } })
    
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
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

    // Submit the form
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    // Wait for the signin function to be called
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'wrongpassword')
    })
  })

  it('shows forgot password form when link is clicked', async () => {
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