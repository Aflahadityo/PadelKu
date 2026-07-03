import { createServerSupabase } from './supabase/server'
import { prisma } from './prisma'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })
  return dbUser
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(role: 'PLAYER' | 'VENUE_OWNER' | 'ADMIN') {
  const user = await requireUser()
  if (user.role !== role) redirect('/')
  return user
}
