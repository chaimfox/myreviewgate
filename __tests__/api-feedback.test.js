import { describe, it, expect, vi, beforeEach } from 'vitest'

const authGetUser = vi.fn()
const insertFeedback = vi.fn()

vi.mock('next/headers', () => ({ cookies: () => ({}) }))

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: { getUser: authGetUser },
  }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'feedback') {
        return {
          insert: (row) => {
            insertFeedback(row)
            return Promise.resolve({ error: null })
          },
        }
      }
      if (table === 'stores') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { name: 'Test Store', owner_email: 'owner@test.com' },
              }),
            }),
          }),
        }
      }
      throw new Error(`unexpected table: ${table}`)
    },
  }),
}))

vi.mock('@/lib/email', () => ({
  sendFeedbackEmail: vi.fn(),
}))

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('derives customer_id from the session, ignoring any client-supplied customerId', async () => {
    authGetUser.mockResolvedValue({ data: { user: { id: 'real-session-user-id' } } })

    const { POST } = await import('../app/api/feedback/route.js')
    const request = {
      json: async () => ({
        storeId: 'store-1',
        rating: 5,
        comment: 'Great!',
        customerEmail: 'me@test.com',
        customerId: 'spoofed-id', // attacker-supplied — must be ignored entirely
      }),
    }

    const res = await POST(request)
    expect(res.status).toBe(200)
    expect(insertFeedback).toHaveBeenCalledTimes(1)
    const insertedRow = insertFeedback.mock.calls[0][0]
    expect(insertedRow.customer_id).toBe('real-session-user-id')
    expect(insertedRow.customer_id).not.toBe('spoofed-id')
  })

  it('rejects submissions missing required fields', async () => {
    authGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('../app/api/feedback/route.js')
    const res = await POST({ json: async () => ({ storeId: 'store-1' }) })
    expect(res.status).toBe(400)
  })

  it('accepts a submission with no email, since phone is already OTP-verified upstream', async () => {
    authGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const { POST } = await import('../app/api/feedback/route.js')
    const request = {
      json: async () => ({ storeId: 'store-1', rating: 4, comment: 'ok', customerPhone: '0501234567' }),
    }
    const res = await POST(request)
    expect(res.status).toBe(200)
  })
})
