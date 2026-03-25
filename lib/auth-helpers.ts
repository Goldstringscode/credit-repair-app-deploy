import { type NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export interface AuthenticatedUser {
  userId: string
  email: string
  role: string
}

export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser | null {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser
  } catch {
    return null
  }
}
