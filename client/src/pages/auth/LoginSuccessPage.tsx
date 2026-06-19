import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '../../store'
import { setCredentials } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const LoginSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        const role = user.role.toLowerCase() as 'student' | 'mentor' | 'admin'

        dispatch(setCredentials({ accessToken: token, user, role }))
        toast.success('Google Login Successful!')

        
        if (role === 'student') {
          navigate('/student/dashboard')
        } else if (role === 'mentor') {
          navigate('/mentor/dashboard')
        } else if (role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } catch (error) {
        toast.error('Failed to parse user credentials.')
        navigate('/login')
      }
    } else {
      toast.error('Invalid login parameters.')
      navigate('/login')
    }
  }, [searchParams, dispatch, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-muted-foreground">Logging in with Google, please wait...</p>
    </div>
  )
}

export default LoginSuccessPage
