import api from './api'
import type { 
  LoginInput, 
  RegisterInput, 
  ApiResponse, 
  AuthResponseData 
} from '../types/auth'

export const authService = {
  async register(data: RegisterInput): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/register', data)
    return response.data
  },

  async login(credentials: LoginInput): Promise<ApiResponse<AuthResponseData>> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials)
    return response.data
  },

  async getProfile(): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>('/auth/profile')
    return response.data
  },

  async updateProfile(profileData: any): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>('/auth/profile', profileData)
    return response.data
  },

  async changePassword(passwordData: any): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/change-password', passwordData)
    return response.data
  },

  async forgotPassword(data: { email: string }): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/forgot-password', data)
    return response.data
  },

  async resetPassword(data: any): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/reset-password', data)
    return response.data
  },
}

export default authService
