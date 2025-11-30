'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, setTokens, setUser } from '@/lib/api'
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
      
      // Store tokens and user data
      setTokens(response.access, response.refresh)
      
      if (response.user) {
        setUser(response.user)
      }
      
      // Redirect to dashboard after successful login
      console.log('Redirecting to dashboard...')
      router.push('/')
      
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
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleInputChange}
                  aria-invalid={fieldErrors.password}
                />
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