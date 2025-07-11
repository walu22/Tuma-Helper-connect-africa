import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { useAuth, AuthProvider } from '../useAuth'
import { mockUser } from '@/test/utils'

// Mock the supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with no user', () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('loads authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('handles sign in', async () => {
    const signInMock = mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await result.current.signIn('test@example.com', 'password')
    
    expect(signInMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
  })

  it('handles sign out', async () => {
    const signOutMock = mockSupabase.auth.signOut.mockResolvedValue({
      error: null,
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await result.current.signOut()
    
    expect(signOutMock).toHaveBeenCalled()
  })

  it('handles authentication errors', async () => {
    const error = new Error('Invalid credentials')
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error,
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await expect(
      result.current.signIn('test@example.com', 'wrongpassword')
    ).rejects.toThrow('Invalid credentials')
  })
})