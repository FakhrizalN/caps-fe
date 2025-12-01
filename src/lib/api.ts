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
    role?: number | string
    role_name?: string
    program_study?: number | string
    program_study_name?: string
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
    document.cookie = 'user_role=; path=/; max-age=0'
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
    console.log('Storing tokens...', { hasAccess: !!accessToken, hasRefresh: !!refreshToken })
    
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    
    // Also set as cookie for middleware with proper attributes
    document.cookie = `access_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax` // 7 days
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax` // 30 days
    
    console.log('Tokens stored successfully')
    console.log('LocalStorage access_token:', localStorage.getItem('access_token') ? 'exists' : 'missing')
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
 * Get stored user data from localStorage
 */
export function getCurrentUser(): any | null {
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
  
  console.log('fetchWithAuth called for:', url, { hasToken: !!accessToken })
  
  // Log request body for debugging
  if (options.body) {
    console.log('Request body:', options.body)
  }
  
  if (!accessToken) {
    console.error('No access token found in localStorage')
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
    const errorText = await response.text()
    let error: any = {}
    try {
      error = JSON.parse(errorText)
    } catch (e) {
      error = { detail: errorText }
    }
    console.error('API Error Response:', error)
    console.error('Response status:', response.status)
    throw new Error(error.detail || JSON.stringify(error) || 'Request failed')
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

export type SurveyType = 'exit' | 'lv1' | 'lv2' | 'skp'

export interface Survey {
  id: string
  title: string
  description?: string
  is_active?: boolean
  survey_type?: SurveyType
  periode?: number | null // For display (returned from backend)
  periode_id?: number | null // For sending to backend
  created_by?: string
  start_at?: string | null
  end_at?: string | null
  created_at?: string
  updated_at?: string
  // For display purposes
  lastEdit?: string
  type?: string
}

export interface CreateSurveyData {
  title: string
  description?: string
  is_active?: boolean
  survey_type: SurveyType // Make required with default
  periode_id?: number | null // Changed to periode_id
  start_at?: string | null
  end_at?: string | null
}

export interface UpdateSurveyData {
  title?: string
  description?: string
  is_active?: boolean
  survey_type?: SurveyType
  periode_id?: number | null // Changed to periode_id
  start_at?: string | null
  end_at?: string | null
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
// User API Functions
// ==========================================

export interface User {
  id: string
  username: string // fullname
  email?: string
  role?: number | string
  role_name?: string
  program_study?: number | string
  program_study_name?: string
  faculty_name?: string
  department_name?: string
  address?: string
  phone_number?: string
  last_survey?: 'none' | 'exit' | 'lv1' | 'lv2'
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  date_joined?: string
  last_login?: string
  created_at?: string
  updated_at?: string
}

export interface CreateUserData {
  id: string
  username: string // fullname
  password: string
  email?: string
  role?: number
  program_study?: number
  address?: string
  phone_number?: string
  last_survey?: 'none' | 'exit' | 'lv1' | 'lv2'
}

export interface UpdateUserData {
  username?: string // fullname
  password?: string
  email?: string
  role?: number
  program_study?: number
  address?: string
  phone_number?: string
  last_survey?: 'none' | 'exit' | 'lv1' | 'lv2'
  is_active?: boolean
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  return fetchWithAuth('/api/users/', {
    method: 'GET',
  })
}

/**
 * Get a single user by ID
 */
export async function getUser(id: string): Promise<User> {
  return fetchWithAuth(`/api/users/${id}/`, {
    method: 'GET',
  })
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  return fetchWithAuth('/api/users/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a user
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  return fetchWithAuth(`/api/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  return fetchWithAuth(`/api/users/${id}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Role API Functions
// ==========================================

export interface Role {
  id: number
  name: string
  description?: string
  permissions?: string[]
  created_at?: string
  updated_at?: string
}

export interface CreateRoleData {
  name: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: string[]
}

/**
 * Get all roles
 */
export async function getRoles(): Promise<Role[]> {
  return fetchWithAuth('/api/roles/', {
    method: 'GET',
  })
}

/**
 * Get a single role by ID
 */
export async function getRole(id: number): Promise<Role> {
  return fetchWithAuth(`/api/roles/${id}/`, {
    method: 'GET',
  })
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleData): Promise<Role> {
  return fetchWithAuth('/api/roles/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a role
 */
export async function updateRole(id: number, data: UpdateRoleData): Promise<Role> {
  return fetchWithAuth(`/api/roles/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a role
 */
export async function deleteRole(id: number): Promise<void> {
  return fetchWithAuth(`/api/roles/${id}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Period (Periode) API Functions
// ==========================================

export interface Period {
  id: number
  name?: string
  category?: string  // Added - this is the periode name in backend
  start_date?: string
  end_date?: string
  order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreatePeriodData {
  category: string  // Changed to category (required)
  order: number     // Made required
  start_date?: string
  end_date?: string
  is_active?: boolean
}

export interface UpdatePeriodData {
  category?: string
  order?: number
  start_date?: string
  end_date?: string
  is_active?: boolean
}

/**
 * Get all periods
 */
export async function getPeriods(): Promise<Period[]> {
  return fetchWithAuth('/api/periodes/', {
    method: 'GET',
  })
}

/**
 * Get a single period by ID
 */
export async function getPeriod(id: number): Promise<Period> {
  return fetchWithAuth(`/api/periodes/${id}/`, {
    method: 'GET',
  })
}

/**
 * Create a new period
 */
export async function createPeriod(data: CreatePeriodData): Promise<Period> {
  return fetchWithAuth('/api/periodes/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a period (PATCH for partial update)
 */
export async function updatePeriod(id: number, data: UpdatePeriodData): Promise<Period> {
  return fetchWithAuth(`/api/periodes/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a period
 */
export async function deletePeriod(id: number): Promise<void> {
  return fetchWithAuth(`/api/periodes/${id}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Program Study API Functions
// ==========================================

export interface ProgramStudy {
  id: number
  name: string
  code?: string
  description?: string
  created_at?: string
  updated_at?: string
}

/**
 * Get all program studies
 */
export async function getProgramStudies(): Promise<ProgramStudy[]> {
  return fetchWithAuth('/api/unit/program-studies/', {
    method: 'GET',
  })
}

/**
 * Get a single program study by ID
 */
export async function getProgramStudy(id: number): Promise<ProgramStudy> {
  return fetchWithAuth(`/api/unit/program-studies/${id}/`, {
    method: 'GET',
  })
}

// ==========================================
// Faculty (Fakultas) API Functions
// ==========================================

export interface Faculty {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface CreateFacultyData {
  name: string
}

export interface UpdateFacultyData {
  name?: string
}

/**
 * Get all faculties
 */
export async function getFaculties(): Promise<Faculty[]> {
  return fetchWithAuth('/api/unit/faculties/', {
    method: 'GET',
  })
}

/**
 * Get a single faculty by ID
 */
export async function getFaculty(id: number): Promise<Faculty> {
  return fetchWithAuth(`/api/unit/faculties/${id}/`, {
    method: 'GET',
  })
}

/**
 * Create a new faculty
 */
export async function createFaculty(data: CreateFacultyData): Promise<Faculty> {
  return fetchWithAuth('/api/unit/faculties/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a faculty (PATCH for partial update)
 */
export async function updateFaculty(id: number, data: UpdateFacultyData): Promise<Faculty> {
  return fetchWithAuth(`/api/unit/faculties/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a faculty
 */
export async function deleteFaculty(id: number): Promise<void> {
  return fetchWithAuth(`/api/unit/faculties/${id}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Department API Functions
// ==========================================

export interface Department {
  id: number
  name: string
  faculty?: number
  faculty_name?: string
  created_at?: string
  updated_at?: string
}

export interface CreateDepartmentData {
  name: string
  faculty: number
}

export interface UpdateDepartmentData {
  name?: string
  faculty?: number
}

/**
 * Get all departments
 */
export async function getDepartments(): Promise<Department[]> {
  return fetchWithAuth('/api/unit/departments/', {
    method: 'GET',
  })
}

/**
 * Get a single department by ID
 */
export async function getDepartment(id: number): Promise<Department> {
  return fetchWithAuth(`/api/unit/departments/${id}/`, {
    method: 'GET',
  })
}

/**
 * Create a new department
 */
export async function createDepartment(data: CreateDepartmentData): Promise<Department> {
  return fetchWithAuth('/api/unit/departments/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a department (PATCH for partial update)
 */
export async function updateDepartment(id: number, data: UpdateDepartmentData): Promise<Department> {
  return fetchWithAuth(`/api/unit/departments/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a department
 */
export async function deleteDepartment(id: number): Promise<void> {
  return fetchWithAuth(`/api/unit/departments/${id}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Program Study API Functions (Updated)
// ==========================================

export interface ProgramStudyDetailed {
  id: number
  name: string
  department?: number
  department_name?: string
  faculty_name?: string
  created_at?: string
  updated_at?: string
}

export interface CreateProgramStudyData {
  name: string
  faculty: number
}

export interface UpdateProgramStudyData {
  name?: string
  faculty?: number
}

/**
 * Get all program studies with optional faculty filter
 */
export async function getProgramStudiesDetailed(facultyId?: number): Promise<ProgramStudyDetailed[]> {
  const url = facultyId 
    ? `/api/unit/program-studies/?faculty_id=${facultyId}`
    : '/api/unit/program-studies/'
  
  return fetchWithAuth(url, {
    method: 'GET',
  })
}

/**
 * Get a single program study by ID (detailed)
 */
export async function getProgramStudyDetailed(id: number): Promise<ProgramStudyDetailed> {
  return fetchWithAuth(`/api/unit/program-studies/${id}/`, {
    method: 'GET',
  })
}

/**
 * Create a new program study
 */
export async function createProgramStudy(data: CreateProgramStudyData): Promise<ProgramStudyDetailed> {
  return fetchWithAuth('/api/unit/program-studies/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a program study (PATCH for partial update)
 */
export async function updateProgramStudy(id: number, data: UpdateProgramStudyData): Promise<ProgramStudyDetailed> {
  return fetchWithAuth(`/api/unit/program-studies/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a program study
 */
export async function deleteProgramStudy(id: number): Promise<void> {
  return fetchWithAuth(`/api/unit/program-studies/${id}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Section API Functions
// ==========================================

export interface Section {
  id: number
  title: string
  description?: string
  order: number
  created_at?: string
  survey_id: number
}

export interface CreateSectionData {
  title: string
  description?: string
  order: number
}

export interface UpdateSectionData {
  title?: string
  description?: string
  order?: number
}

/**
 * Get all sections for a survey
 */
export async function getSections(surveyId: number): Promise<Section[]> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/`, {
    method: 'GET',
  })
}

/**
 * Get a single section by ID
 */
export async function getSection(surveyId: number, sectionId: number): Promise<Section> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/`, {
    method: 'GET',
  })
}

/**
 * Create a new section
 */
export async function createSection(surveyId: number, data: CreateSectionData): Promise<Section> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a section (PATCH for partial update)
 */
export async function updateSection(surveyId: number, sectionId: number, data: UpdateSectionData): Promise<Section> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a section
 */
export async function deleteSection(surveyId: number, sectionId: number): Promise<void> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Question API Functions
// ==========================================

export interface Question {
  id: number | string // Support both number (DB) and string (temp-xxx)
  text: string
  question_type: string // Backend values: 'text', 'number', 'radio', 'checkbox', 'scale', 'dropdown'
  options?: any // JSON field
  code?: string
  source?: string
  description?: string
  order: number
  is_required: boolean
  created_at?: string
  section_id: number
  branches?: QuestionBranch[]
}

export interface QuestionBranch {
  id?: number
  question_id?: number
  answer_value: string // The option ID or value that triggers this branch
  next_section: number // Section ID to navigate to
}

export interface CreateQuestionBranchData {
  answer_value: string
  next_section: number
}

export interface CreateQuestionData {
  text: string
  question_type: string // Backend values: 'text', 'number', 'radio', 'checkbox', 'scale', 'dropdown'
  options?: any
  code?: string
  source?: string
  description?: string
  order: number
  is_required: boolean
}

export interface UpdateQuestionData {
  text?: string
  question_type?: string
  options?: any
  code?: string
  source?: string
  description?: string
  order?: number
  is_required?: boolean
  branches?: Array<{ answer_value: string; next_section: number }>
}

/**
 * Get all questions for a section
 */
export async function getQuestions(surveyId: number, sectionId: number): Promise<Question[]> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/`, {
    method: 'GET',
  })
}

/**
 * Get a single question by ID
 */
export async function getQuestion(surveyId: number, sectionId: number, questionId: number): Promise<Question> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/${questionId}/`, {
    method: 'GET',
  })
}

/**
 * Create a new question for a section
 */
export async function createQuestion(surveyId: number, sectionId: number, data: CreateQuestionData): Promise<Question> {
  // Stringify options if it's an array/object
  const payload = {
    ...data,
    options: data.options ? JSON.stringify(data.options) : null
  }
  
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Update a question (PATCH for partial update)
 */
export async function updateQuestion(surveyId: number, sectionId: number, questionId: number, data: UpdateQuestionData): Promise<Question> {
  // Build payload
  const payload: any = { ...data }
  
  // If branches are present, options should already be cleaned (array of strings)
  // Otherwise, handle backward compatibility with old format
  if (data.branches && data.branches.length > 0) {
    // Options should be array of strings for branch validation
    // Send as-is (already cleaned in handleUpdateQuestion)
    payload.options = data.options
  } else {
    // Parse and stringify options for backward compatibility
    let parsedOptions = data.options
    if (data.options !== undefined) {
      if (typeof data.options === 'string') {
        try {
          parsedOptions = JSON.parse(data.options)
        } catch (e) {
          parsedOptions = data.options
        }
      }
    }
    
    // Stringify options if it's an array/object
    if (typeof parsedOptions === 'string') {
      payload.options = parsedOptions
    } else {
      payload.options = JSON.stringify(parsedOptions)
    }
  }
  
  // Branches should be sent as-is (array of objects)
  // Backend expects: [{ answer_value: string, next_section: number }]
  
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/${questionId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Delete a question
 */
export async function deleteQuestion(surveyId: number, sectionId: number, questionId: number): Promise<void> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/${questionId}/`, {
    method: 'DELETE',
  })
}

/**
 * Get all branches for a question
 */
export async function getQuestionBranches(surveyId: number, sectionId: number, questionId: number): Promise<QuestionBranch[]> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/${questionId}/branches/`, {
    method: 'GET',
  })
}

/**
 * Create a new branch for a question
 */
export async function createQuestionBranch(surveyId: number, sectionId: number, questionId: number, data: CreateQuestionBranchData): Promise<QuestionBranch> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/${questionId}/branches/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update a question branch
 */
export async function updateQuestionBranch(surveyId: number, sectionId: number, questionId: number, branchId: number, data: Partial<CreateQuestionBranchData>): Promise<QuestionBranch> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/${questionId}/branches/${branchId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a question branch
 */
export async function deleteQuestionBranch(surveyId: number, sectionId: number, questionId: number, branchId: number): Promise<void> {
  return fetchWithAuth(`/api/surveys/${surveyId}/sections/${sectionId}/questions/${questionId}/branches/${branchId}/`, {
    method: 'DELETE',
  })
}

// ==========================================
// Survey Answers API Functions
// ==========================================

export interface Answer {
  id: number
  user_id: string
  user_username: string
  user_email: string
  user_program_study?: string
  survey: number
  question: number
  question_text: string
  question_type: string
  program_specific_question: null | any
  answer_value: string | number | boolean
  created_at: string
  updated_at: string
}

/**
 * Get all answers for a survey
 */
export async function getAnswers(surveyId: number): Promise<Answer[]> {
  return fetchWithAuth(`/api/surveys/${surveyId}/answers/`, {
    method: 'GET',
  })
}

/**
 * Get answers for a specific user in a survey
 */
export async function getUserAnswers(surveyId: number, userId: string): Promise<Answer[]> {
  return fetchWithAuth(`/api/surveys/${surveyId}/answers/?user_id=${userId}`, {
    method: 'GET',
  })
}

/**
 * Get a single answer by ID
 */
export async function getAnswer(surveyId: number, answerId: number): Promise<Answer> {
  return fetchWithAuth(`/api/surveys/${surveyId}/answers/${answerId}/`, {
    method: 'GET',
  })
}

/**
 * Delete an answer by ID
 */
export async function deleteAnswer(surveyId: number, answerId: number): Promise<void> {
  return fetchWithAuth(`/api/surveys/${surveyId}/answers/${answerId}/`, {
    method: 'DELETE',
  })
}

// ============================================
// Program Study Questions API
// ============================================

export interface ProgramStudyQuestion {
  id: number | string
  text: string
  question_type: string
  options?: any
  code?: string
  source?: string
  description?: string
  order: number
  is_required: boolean
  created_at?: string
  program_study: number
  survey?: number
}

export interface CreateProgramStudyQuestionData {
  text: string
  question_type: string
  options?: string[] | string
  code?: string
  source?: string
  description?: string
  order: number
  is_required?: boolean
}

export interface UpdateProgramStudyQuestionData {
  text?: string
  question_type?: string
  options?: string[] | string | any
  code?: string
  source?: string
  description?: string
  order?: number
  is_required?: boolean
}

/**
 * Get all program study questions
 */
export async function getProgramStudyQuestions(surveyId: number, programStudyId: number): Promise<ProgramStudyQuestion[]> {
  return fetchWithAuth(`/api/surveys/${surveyId}/programs/${programStudyId}/questions/`, {
    method: 'GET',
  })
}

/**
 * Get a single program study question
 */
export async function getProgramStudyQuestion(surveyId: number, programStudyId: number, questionId: number): Promise<ProgramStudyQuestion> {
  return fetchWithAuth(`/api/surveys/${surveyId}/programs/${programStudyId}/questions/${questionId}/`, {
    method: 'GET',
  })
}

/**
 * Create a new program study question
 */
export async function createProgramStudyQuestion(surveyId: number, programStudyId: number, data: CreateProgramStudyQuestionData): Promise<ProgramStudyQuestion> {
  const payload: any = { ...data }
  
  // Convert options from object format [{id, label}] to string array ["label1", "label2"]
  if (payload.options && Array.isArray(payload.options)) {
    payload.options = payload.options.map((opt: any) => {
      if (typeof opt === 'string') return opt
      if (opt && typeof opt === 'object' && opt.label) return opt.label
      if (opt && typeof opt === 'object' && opt.text) return opt.text
      if (opt && typeof opt === 'object' && opt.value) return opt.value
      return String(opt)
    })
  }
  
  // Send as JSON string to backend
  if (payload.options) {
    payload.options = JSON.stringify(payload.options)
  }
  
  return fetchWithAuth(`/api/surveys/${surveyId}/programs/${programStudyId}/questions/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Update a program study question
 */
export async function updateProgramStudyQuestion(surveyId: number, programStudyId: number, questionId: number, data: UpdateProgramStudyQuestionData): Promise<ProgramStudyQuestion> {
  const payload: any = { ...data }
  
  // Convert options from object format [{id, label}] to string array ["label1", "label2"]
  if (payload.options && Array.isArray(payload.options)) {
    payload.options = payload.options.map((opt: any) => {
      if (typeof opt === 'string') return opt
      if (opt && typeof opt === 'object' && opt.label) return opt.label
      if (opt && typeof opt === 'object' && opt.text) return opt.text
      if (opt && typeof opt === 'object' && opt.value) return opt.value
      return String(opt)
    })
  }
  
  // Send as JSON string to backend
  if (payload.options) {
    payload.options = JSON.stringify(payload.options)
  }
  
  return fetchWithAuth(`/api/surveys/${surveyId}/programs/${programStudyId}/questions/${questionId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Delete a program study question
 */
export async function deleteProgramStudyQuestion(surveyId: number, programStudyId: number, questionId: number): Promise<void> {
  return fetchWithAuth(`/api/surveys/${surveyId}/programs/${programStudyId}/questions/${questionId}/`, {
    method: 'DELETE',
  })
}


