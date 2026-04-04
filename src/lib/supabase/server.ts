import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  // wrapper that normalizes different runtime shapes of Next's cookies()
  const normalizeCookies = {
    get(name: string) {
      // 1) Preferred: RequestCookies API: cookieStore.get(name) -> { name, value } | undefined
      try {
        const maybe = (cookieStore as any).get?.(name)
        if (maybe !== undefined) {
          // if it's a string (some runtimes return string) return it, otherwise return .value if present
          return typeof maybe === 'string' ? maybe : maybe?.value
        }
      } catch (e) {
        // fall through to other checks if calling .get threw for some reason
      }

      // 2) Alternate: some environments expose cookies as an object / map: cookieStore[name] or cookieStore.getCookie
      const altByKey = (cookieStore as any)[name]
      if (typeof altByKey === 'string') return altByKey
      if (altByKey && typeof altByKey.value === 'string') return altByKey.value

      const altMethod = (cookieStore as any).getCookie ?? (cookieStore as any).get_cookie
      if (typeof altMethod === 'function') {
        const r = altMethod(name)
        return typeof r === 'string' ? r : r?.value
      }

      // 3) If nothing matched, return undefined (cookie not found)
      return undefined
    },

    set(name: string, value: string, options: CookieOptions) {
      // Preferred: RequestCookies.set({ name, value, ...options })
      if (typeof (cookieStore as any).set === 'function') {
        return (cookieStore as any).set({ name, value, ...options })
      }

      // Alternate: setCookie(name, value, options)
      if (typeof (cookieStore as any).setCookie === 'function') {
        return (cookieStore as any).setCookie(name, value, options)
      }

      // Last resort: throw so you see the incompatibility
      throw new Error('cookies().set is not supported in this runtime')
    },

    remove(name: string, options: CookieOptions) {
      // Preferred: RequestCookies.delete or set to empty value with expiry
      if (typeof (cookieStore as any).delete === 'function') {
        return (cookieStore as any).delete(name)
      }
      if (typeof (cookieStore as any).remove === 'function') {
        return (cookieStore as any).remove(name)
      }

      // Fallback to setting empty value (Supabase often expects this pattern)
      if (typeof (cookieStore as any).set === 'function') {
        return (cookieStore as any).set({ name, value: '', ...options })
      }

      // If nothing available, throw so the runtime mismatch is obvious
      throw new Error('cookies().remove/delete is not supported in this runtime')
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: normalizeCookies }
  )
}
