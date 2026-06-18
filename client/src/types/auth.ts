import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'MENTOR']),
  title: z.string().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().min(0, 'Hourly rate must be 0 or greater').optional(),
  stackId: z.union([z.number(), z.literal('')]).optional(),
}).refine((data) => {
  if (data.role === 'MENTOR') {
    return !!data.title && data.stackId !== undefined && data.stackId !== '';
  }
  return true;
}, {
  message: 'Title and Stack are required for mentors',
  path: ['title'],
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export interface AuthUser {
  id: number
  email: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
  name: string
  profilePicture?: string | null
}

export interface AuthResponseData {
  accessToken: string
  user: AuthUser
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}
