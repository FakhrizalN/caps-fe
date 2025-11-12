// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface LoginRequest {
  id: string
  password: string
}

interface LoginResponse {
  access: string
  refresh: string
  user?: {
    id: string
    email?: string
    username?: string
    first_name?: string
    last_name?: string
  }
}

interface ApiError {
  detail?: string
  id?: string[]
  password?: string[]
  non_field_errors?: string[]
}

/**
 * Login user with Django backend
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    console.log('Making POST request to:', `${API_BASE_URL}/accounts/login/`)
    console.log('Request payload:', { id: credentials.id, password: '***' })
    
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({}))
      console.error('Error response:', error)
      
      // Handle specific error messages
      if (error.detail) {
        throw new Error(error.detail)
      }
      
      if (error.non_field_errors) {
        throw new Error(error.non_field_errors.join(', '))
      }
      
      if (error.id) {
        throw new Error(`ID: ${error.id.join(', ')}`)
      }
      
      if (error.password) {
        throw new Error(`Password: ${error.password.join(', ')}`)
      }
      
      throw new Error('Login gagal. Periksa ID dan password Anda.')
    }

    const data = await response.json()
    console.log('Login successful, received data:', { 
      hasAccess: !!data.access, 
      hasRefresh: !!data.refresh,
      hasUser: !!data.user 
    })
    return data
  } catch (error) {
    console.error('Catch block error:', error)
    console.error('Error type:', error instanceof TypeError ? 'TypeError' : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    
    // Handle network errors
    if (error instanceof TypeError) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend Django berjalan di http://localhost:8000 dan CORS dikonfigurasi dengan benar.')
    }
    throw error
  }
}

/**
 * Logout user (clear tokens)
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    // Clear cookies
    document.cookie = 'access_token=; path=/; max-age=0'
    document.cookie = 'refresh_token=; path=/; max-age=0'
  }
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  return null
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token')
  }
  return null
}

/**
 * Store authentication tokens
 */
export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    
    // Also set as cookie for middleware
    document.cookie = `access_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}` // 30 days
  }
}

/**
 * Store user data
 */
export function setUser(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

/**
 * Get stored user data
 */
export function getUser(): any | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
  return null
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!response.ok) {
    logout()
    throw new Error('Session expired. Please login again.')
  }

  const data = await response.json()
  setTokens(data.access, refreshToken)
  
  return data.access
}

/**
 * Fetch with authentication
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let accessToken = getAccessToken()
  
  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken()
      
      // Retry request with new token
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Request failed')
  }

  // Handle 204 No Content (DELETE requests)
  if (response.status === 204) {
    return undefined
  }

  // Parse JSON for other responses
  return response.json()
}

// ==========================================
// Survey API Functions
// ==========================================

export interface Survey {
  id: string
  title: string
  lastEdit?: string
  type?: string
  created_at?: string
  updated_at?: string
  description?: string
  is_active?: boolean
  periode?: string
}

export interface CreateSurveyData {
  title: string
  description?: string
  is_active?: boolean
  periode?: string
}

export interface UpdateSurveyData {
  title?: string
  description?: string
  is_active?: boolean
  periode?: string
}

/**
 * Get all surveys
 */
export async function getSurveys(): Promise<Survey[]> {
  return fetchWithAuth('/api/surveys/', {
    method: 'GET',
  })
}

/**
 * Get a single survey by ID
 */
export async function getSurvey(id: string): Promise<Survey> {
  return fetchWithAuth(`/api/surveys/${id}/`, {
    method: 'GET',
  })
}

/**
 * Create a new survey
 */
export async function createSurvey(data: CreateSurveyData): Promise<Survey> {
  return fetchWithAuth('/api/surveys/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a survey
 */
export async function updateSurvey(id: string, data: UpdateSurveyData): Promise<Survey> {
  return fetchWithAuth(`/api/surveys/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a survey
 */
export async function deleteSurvey(id: string): Promise<void> {
  return fetchWithAuth(`/api/surveys/${id}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Template API Functions
// ==========================================

export interface Template {
  id: string
  title: string
  description?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
}

/**
 * Get all templates
 */
export async function getTemplates(): Promise<Template[]> {
  return fetchWithAuth('/api/templates/', {
    method: 'GET',
  })
}

/**
 * Get a single template by ID
 */
export async function getTemplate(id: string): Promise<Template> {
  return fetchWithAuth(`/api/templates/${id}/`, {
    method: 'GET',
  })
}
