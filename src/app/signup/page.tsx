'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'

// Validation functions
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  return null
}

const validateFullName = (name: string): string | null => {
  if (!name) return 'Full name is required'
  if (name.trim().length < 2) return 'Full name must be at least 2 characters'
  if (name.trim().length > 50) return 'Full name must be less than 50 characters'
  return null
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate all fields
    const nameError = validateFullName(fullName)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (nameError || emailError || passwordError) {
      setFieldErrors({
        fullName: nameError || '',
        email: emailError || '',
        password: passwordError || '',
      })
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, fullName)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Get started with Task Manager</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`pl-10 w-full px-4 py-3 border ${
                    fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="John Doe"
                  required
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 w-full px-4 py-3 border ${
                    fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 w-full px-4 py-3 border ${
                    fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {fieldErrors.password ? (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}