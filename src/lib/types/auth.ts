export interface User {
  id: string
  email: string
  full_name: string | null
}

export interface AuthError {
  message: string
  status?: number
}
