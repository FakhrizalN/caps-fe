'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
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
      email: !formData.email.trim(),
      password: !formData.password.trim()
    }
    
    setFieldErrors(errors)
    return !errors.email && !errors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Custom validation
    if (!validateForm()) {
      setError('Email dan password harus diisi')
      return
    }
    
    setIsLoading(true)
    setError('')

    try {
      // Implementasi login API call di sini
      console.log('Login attempt:', formData)
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect setelah login berhasil
      router.push('/dashboard')
    } catch (err) {
      setError('Login gagal. Periksa email dan password Anda.')
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Masukkan alamat email"
                  value={formData.email}
                  onChange={handleInputChange}
                  aria-invalid={fieldErrors.email}
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