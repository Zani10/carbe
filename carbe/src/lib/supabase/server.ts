import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Improved API route client with both cookie and auth header support
export function createApiRouteSupabaseClient(request: NextRequest) {
  const cookieStore = request.cookies
  const authHeader = request.headers.get('authorization')

  // If we have a Bearer token, use it to create a client with global headers
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    console.log('Using Bearer token authentication')
    
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        cookies: {
          getAll() {
            return cookieStore.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value,
            }))
          },
          setAll() {
            // API routes don't need to set cookies
          },
        },
      }
    )
  }

  // Fallback to cookie-based auth
  console.log('Using cookie-based authentication')
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          // For API routes, we don't need to set cookies
          // but we can log them for debugging
          console.log('Cookies to set:', cookiesToSet.map(c => c.name))
        },
      },
    }
  )
}

// Alternative using the cookies() helper for API routes
export async function createApiRouteSupabaseClientFromCookies() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // API routes typically don't need to set cookies
        },
      },
    }
  )
} 