import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import ServiceCategories from '../ServiceCategories'

// Mock the supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
  })),
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

const mockCategories = [
  {
    id: '1',
    name: 'Plumbing',
    description: 'Professional plumbing services',
    icon: '🔧',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Electrical',
    description: 'Licensed electrical work',
    icon: '⚡',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

describe('ServiceCategories Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockCategories,
        error: null,
      }),
    })
  })

  it('renders service categories', async () => {
    render(<ServiceCategories />)
    
    await waitFor(() => {
      expect(screen.getByText('Plumbing')).toBeInTheDocument()
      expect(screen.getByText('Electrical')).toBeInTheDocument()
    })
  })

  it('displays category descriptions', async () => {
    render(<ServiceCategories />)
    
    await waitFor(() => {
      expect(screen.getByText('Professional plumbing services')).toBeInTheDocument()
      expect(screen.getByText('Licensed electrical work')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    render(<ServiceCategories />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles error state gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    })

    render(<ServiceCategories />)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})