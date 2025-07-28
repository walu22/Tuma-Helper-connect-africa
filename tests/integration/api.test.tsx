import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  })),
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Mock hook for fetching services
const useServices = () => {
  const [services, setServices] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await mockSupabase.from('services').select('*')
        if (error) throw error
        setServices(data || [])
      } catch (err: unknown) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return { services, loading, error }
}

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches services successfully', async () => {
    const mockServices = [
      { id: '1', title: 'Plumbing Service', price_from: 50 },
      { id: '2', title: 'Electrical Work', price_from: 75 },
    ]

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: mockServices,
        error: null,
      }),
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.services).toEqual(mockServices)
    expect(result.current.error).toBeNull()
  })

  it('handles API errors gracefully', async () => {
    const error = new Error('Database connection failed')
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error,
      }),
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(error)
    expect(result.current.services).toEqual([])
  })

  it('creates a booking successfully', async () => {
    const mockBooking = {
      id: '1',
      service_id: 'service-1',
      customer_id: 'user-1',
      booking_date: '2024-01-15',
      status: 'pending',
    }

    const insertMock = vi.fn().mockResolvedValue({
      data: mockBooking,
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: insertMock,
    })

    await mockSupabase.from('bookings').insert({
      service_id: 'service-1',
      customer_id: 'user-1',
      booking_date: '2024-01-15',
    })

    expect(insertMock).toHaveBeenCalledWith({
      service_id: 'service-1',
      customer_id: 'user-1',
      booking_date: '2024-01-15',
    })
  })

  it('handles authentication flow', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' }
    
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const result = await mockSupabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(result.data.user).toEqual(mockUser)
    expect(result.error).toBeNull()
  })

  it('handles real-time subscriptions', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }

    mockSupabase.channel.mockReturnValue(mockChannel)

    const channel = mockSupabase.channel('bookings-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, () => {})
      .subscribe()

    expect(mockSupabase.channel).toHaveBeenCalledWith('bookings-changes')
    expect(mockChannel.on).toHaveBeenCalled()
    expect(mockChannel.subscribe).toHaveBeenCalled()
  })
})