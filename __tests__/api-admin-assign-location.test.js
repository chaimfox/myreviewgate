import { describe, it, expect, vi, beforeEach } from 'vitest'

const authGetUser = vi.fn()
const profileSingle = vi.fn()
const upsertProfile = vi.fn()

vi.mock('next/headers', () => ({ cookies: () => ({}) }))

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: { getUser: authGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: profileSingle,
        }),
      }),
    }),
  }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({
          data: { users: [{ id: 'target-user-id', email: 'branch@store.com' }] },
          error: null,
        }),
      },
    },
    from: () => ({
      upsert: (row) => {
        upsertProfile(row)
        return Promise.resolve({ error: null })
      },
    }),
  }),
}))

describe('POST /api/admin/assign-location — super_admin gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated requests with 401', async () => {
    authGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('../app/api/admin/assign-location/route.js')
    const res = await POST({ json: async () => ({}) })
    expect(res.status).toBe(401)
  })

  it('rejects a logged-in user who is not super_admin with 403', async () => {
    authGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    profileSingle.mockResolvedValue({ data: { role: 'branch_manager' } })
    const { POST } = await import('../app/api/admin/assign-location/route.js')
    const res = await POST({ json: async () => ({ email: 'branch@store.com', location_id: 'loc-1' }) })
    expect(res.status).toBe(403)
    expect(upsertProfile).not.toHaveBeenCalled()
  })

  it('allows a super_admin to assign a branch manager', async () => {
    authGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
    profileSingle.mockResolvedValue({ data: { role: 'super_admin' } })
    const { POST } = await import('../app/api/admin/assign-location/route.js')
    const res = await POST({ json: async () => ({ email: 'branch@store.com', location_id: 'loc-1' }) })
    expect(res.status).toBe(200)
    expect(upsertProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'target-user-id', location_id: 'loc-1', role: 'branch_manager' })
    )
  })
})
