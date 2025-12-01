'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, setTokens, setUser } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    id: false,
    password: false
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: false
      }))
    }
  }

  const validateForm = () => {
    const errors = {
      id: !formData.id.trim(),
      password: !formData.password.trim()
    }
    
    setFieldErrors(errors)
    return !errors.id && !errors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Custom validation
    if (!validateForm()) {
      setError('ID dan password harus diisi')
      return
    }
    
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login to:', process.env.NEXT_PUBLIC_API_URL)
      console.log('Login credentials:', { id: formData.id, password: '***' })
      
      // Call Django login API
      const response = await login({
        id: formData.id,
        password: formData.password
      })
      
      console.log('Login successful:', { 
        hasAccess: !!response.access, 
        hasRefresh: !!response.refresh,
        hasUser: !!response.user 
      })
      
      // Store tokens
      setTokens(response.access, response.refresh)
      
      // Decode JWT token to get user info
      try {
        const payload = JSON.parse(atob(response.access.split('.')[1]))
        console.log('JWT Payload:', payload)
        
        // Store user role from JWT token
        if (payload.role) {
          document.cookie = `user_role=${payload.role}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
          
          // Also store in localStorage for sidebar
          const userData = {
            id: payload.user_id,
            role_name: payload.role
          }
          setUser(userData)
        }
      } catch (err) {
        console.error('Error decoding JWT:', err)
      }
      
      // Redirect to dashboard after successful login
      console.log('Redirecting to dashboard...')
      router.push('/dashboard')
      
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Login gagal. Periksa ID dan password Anda.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/LogoITK.png" 
              alt="Institut Teknologi Kalimantan" 
              className="h-50 w-auto"
            />
          </div>
          <CardTitle className="text-xl font-bold text-gray-700">
            Tracer Study Alumni ITK
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <Field>
                <Label htmlFor="id">NIM / NIP</Label>
                <Input
                  id="id"
                  name="id"
                  type="text"
                  autoComplete="username"
                  placeholder="Masukkan NIM atau NIP"
                  value={formData.id}
                  onChange={handleInputChange}
                  aria-invalid={fieldErrors.id}
                />
              </Field>

              <Field>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleInputChange}
                    aria-invalid={fieldErrors.password}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={checked => setRememberMe(checked === true)}
                />
                <Label 
                  htmlFor="remember-me" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Ingat saya
                </Label>
              </div>

              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-primary hover:text-primary/80 underline"
              >
                Lupa password?
              </Link>
            </div>

            {error && (
              <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}