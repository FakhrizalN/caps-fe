"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionCardGForm, QuestionData } from "@/components/question_card_gform"
import { QuestionToolbar } from "@/components/question_toolbar"
import { SectionHeaderCard } from "@/components/section_header_card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Answer, deleteAnswer, getAnswers, getCurrentUser, getProgramStudyQuestions, getQuestions, getSections, getSurvey, ProgramStudyQuestion, Question, Section } from "@/lib/api"
import { ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import * as XLSX from 'xlsx'

interface UniqueUser {
  id: string     
  nama: string
  nim: string
}

interface SectionWithQuestions {
  section: Section
  questions: Question[]
  answers: Answer[]
}

interface ProgramStudyQuestionsGroup {
  questions: ProgramStudyQuestion[]
  answers: Answer[]
}

export default function ResponseDetailPage() {
  const params = useParams()
  const surveyId = Number(params?.id)

  const [allUsers, setAllUsers] = useState<UniqueUser[]>([])
  const [surveyTitle, setSurveyTitle] = useState("Loading...")
  const [currentUserNim, setCurrentUserNim] = useState<string>("")
  const [userAnswers, setUserAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [sectionsWithQuestions, setSectionsWithQuestions] = useState<SectionWithQuestions[]>([])
  const [programStudyQuestions, setProgramStudyQuestions] = useState<ProgramStudyQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [programStudyId, setProgramStudyId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setIsLoading(true)

        if (!surveyId || isNaN(surveyId)) {
          throw new Error("Invalid survey ID")
        }
        
        const survey = await getSurvey(surveyId.toString())
        setSurveyTitle(survey.title)
        // Fetch semua sections
        const sections = await getSections(surveyId)
        
        // Fetch questions dari setiap section
        const allQuestions: Question[] = []
        const sectionsData: SectionWithQuestions[] = []
        
        for (const section of sections) {
          const sectionQuestions = await getQuestions(surveyId, section.id)
          allQuestions.push(...sectionQuestions)
          
          sectionsData.push({
            section,
            questions: sectionQuestions,
            answers: []
          })
        }
        
        setQuestions(allQuestions)
        setSectionsWithQuestions(sectionsData)
        
        // Get program study ID from user
        const user = getCurrentUser()
        console.log("Response detail - Current user:", user)
        let userProgramStudyId = 1 // default
        if (user?.program_study) {
          console.log("Response detail - Setting programStudyId to:", user.program_study)
          userProgramStudyId = user.program_study
          setProgramStudyId(user.program_study.toString())
        } else {
          console.warn("Response detail - No program_study found, using default: 1")
          setProgramStudyId("1")
        }
        
        // Fetch program study questions
        try {
          const programQuestions = await getProgramStudyQuestions(surveyId, userProgramStudyId)
          setProgramStudyQuestions(programQuestions)
          console.log("📚 Program Study Questions:", programQuestions)
        } catch (error) {
          console.log("No program study questions found or error:", error)
          setProgramStudyQuestions([])
        }
        
        console.log("📚 Questions with options:", allQuestions)
        
        // Log detail untuk setiap question yang punya options
        allQuestions.forEach(q => {
          if (q.options) {
            console.log(`Question ${q.id} (${q.question_type}):`, {
              optionsType: typeof q.options,
              optionsRaw: q.options,
              optionsParsed: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
            })
          }
        })

        const allAnswers: Answer[] = await getAnswers(surveyId)
        console.log("📋 All answers:", allAnswers)

        const uniqueUsers = new Map<string, UniqueUser>()

        allAnswers.forEach((answer) => {
          if (!uniqueUsers.has(answer.user_id)) {
            uniqueUsers.set(answer.user_id, {
              id: answer.user_id,
              nama: answer.user_username,
              nim: answer.user_id,
            })
          }
        })

        const userList = Array.from(uniqueUsers.values())
        setAllUsers(userList)
        console.log("👥 Unique users:", userList)

        if (userList.length > 0 && !currentUserNim) {
          setCurrentUserNim(userList[0].nim)
        }
      } catch (err) {
        console.error("❌ Error fetching users:", err)
        setError(
          err instanceof Error ? err.message : "Error loading users",
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (surveyId && !isNaN(surveyId)) {
      fetchAllUsers()
    }
  }, [surveyId, currentUserNim])

  useEffect(() => {
    const fetchUserAnswers = async () => {
      try {
        if (!currentUserNim || !surveyId || isNaN(surveyId)) return

        console.log(`📝 Fetching answers untuk user (NIM/user_id): ${currentUserNim}`)

        const allAnswers: Answer[] = await getAnswers(surveyId)

        const answers = allAnswers.filter(
          (a) => a.user_id === currentUserNim,
        )

        console.log("✅ User answers:", answers)

        const sorted = answers.sort((a, b) => a.question - b.question)
        setUserAnswers(sorted)

        if (answers.length > 0) {
          setUserName(answers[0].user_username)
          setUserEmail(answers[0].user_email)
        }
      } catch (err) {
        console.error("❌ Error fetching answers:", err)
        setError(
          err instanceof Error ? err.message : "Error loading answers",
        )
      }
    }

    fetchUserAnswers()
  }, [surveyId, currentUserNim])

  const currentIndex =
    allUsers.findIndex((u) => u.nim === currentUserNim) + 1

  const handlePrevious = () => {
    const prevIndex = currentIndex - 2
    if (prevIndex >= 0) {
      setCurrentUserNim(allUsers[prevIndex].nim)
    }
  }

  const handleNext = () => {
    if (currentIndex < allUsers.length) {
      setCurrentUserNim(allUsers[currentIndex].nim)
    }
  }

  const handleUserChange = (nim: string) => {
    setCurrentUserNim(nim)
  }

  const handleDelete = async () => {
    try {
      if (!confirm(`Hapus semua jawaban dari ${userName}?`)) {
        return
      }

      setIsDeleting(true)

      // Hapus semua jawaban user satu per satu
      const deletePromises = userAnswers.map(answer => 
        deleteAnswer(surveyId, answer.id)
      )
      
      await Promise.all(deletePromises)
      
      // Update state setelah delete berhasil
      const newUsers = allUsers.filter(u => u.nim !== currentUserNim)
      setAllUsers(newUsers)
      
      if (newUsers.length > 0) {
        // Pindah ke user pertama yang tersisa
        setCurrentUserNim(newUsers[0].nim)
      } else {
        // Tidak ada user lagi
        alert('Semua response telah dihapus')
      }
    } catch (error) {
      console.error('Error deleting answers:', error)
      alert('Gagal menghapus jawaban. Silakan coba lagi.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = async () => {
    try {
      // Fetch semua jawaban untuk survey ini
      const allAnswers: Answer[] = await getAnswers(surveyId)
      
      if (allAnswers.length === 0) {
        alert('Tidak ada data untuk diekspor')
        return
      }

      // Group answers by user
      const userAnswersMap = new Map<string, Answer[]>()
      allAnswers.forEach(answer => {
        if (!userAnswersMap.has(answer.user_id)) {
          userAnswersMap.set(answer.user_id, [])
        }
        userAnswersMap.get(answer.user_id)?.push(answer)
      })

      // Sort questions by order and get question codes
      const sortedQuestions = [...questions].sort((a, b) => a.order - b.order)
      
      // Create header row
      const headers = ['Nama Prodi', 'Nama', 'Email']
      sortedQuestions.forEach(q => {
        const code = q.code || `Q${q.id}`
        headers.push(code)
      })

      // Create data rows
      const rows: any[][] = []
      
      userAnswersMap.forEach((answers, userId) => {
        if (answers.length === 0) return
        
        const firstAnswer = answers[0]
        const row: any[] = [
          firstAnswer.user_program_study || '-',
          firstAnswer.user_username || '-',
          firstAnswer.user_email || '-'
        ]

        // Create a map of question_id -> answer for quick lookup
        const answerMap = new Map<number, Answer>()
        answers.forEach(ans => {
          answerMap.set(ans.question, ans)
        })

        // Add answers in question order
        sortedQuestions.forEach(q => {
          const answer = answerMap.get(Number(q.id))
          if (answer) {
            // Format answer based on type
            let formattedAnswer = ''
            
            if (Array.isArray(answer.answer_value)) {
              // For checkbox - join array items
              if (answer.answer_value.length > 0 && typeof answer.answer_value[0] === 'object' && 'label' in answer.answer_value[0]) {
                // Format: [{"id": "1", "label": "Reading"}]
                formattedAnswer = answer.answer_value.map((item: any) => item.label).join(', ')
              } else {
                // Format: ["Reading", "Music"] or ["1", "3"]
                formattedAnswer = answer.answer_value.join(', ')
              }
            } else if (typeof answer.answer_value === 'string') {
              // Try to parse if it's JSON
              try {
                const parsed = JSON.parse(answer.answer_value)
                if (Array.isArray(parsed)) {
                  if (parsed.length > 0 && typeof parsed[0] === 'object' && 'label' in parsed[0]) {
                    formattedAnswer = parsed.map((item: any) => item.label).join(', ')
                  } else {
                    formattedAnswer = parsed.join(', ')
                  }
                } else {
                  formattedAnswer = answer.answer_value
                }
              } catch {
                formattedAnswer = answer.answer_value
              }
            } else {
              formattedAnswer = String(answer.answer_value)
            }
            
            row.push(formattedAnswer)
          } else {
            row.push('-')
          }
        })

        rows.push(row)
      })

      // Create workbook
      const wb = XLSX.utils.book_new()
      const wsData = [headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(wsData)

      // Set column widths
      const colWidths = [
        { wch: 25 }, // Nama Prodi
        { wch: 25 }, // Nama
        { wch: 30 }, // Email
      ]
      
      // Add width for question columns
      sortedQuestions.forEach(() => {
        colWidths.push({ wch: 20 })
      })
      
      ws['!cols'] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses')

      // Generate and download Excel file
      XLSX.writeFile(wb, `survey_${surveyId}_responses.xlsx`)
      
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Gagal mengekspor data. Silakan coba lagi.')
    }
  }

  const convertProgramStudyAnswerToResponseAnswer = (
    answer: Answer,
    idx: number,
  ): QuestionData => {
    // Cari program study question yang sesuai
    const question = programStudyQuestions.find(q => Number(q.id) === answer.program_specific_question)
    
    console.log(`🔍 Converting program study answer for question ${answer.program_specific_question}:`, {
      answerQuestionType: answer.question_type,
      questionQuestionType: question?.question_type,
      answerValue: answer.answer_value,
      answerValueType: typeof answer.answer_value,
      answerValueIsArray: Array.isArray(answer.answer_value),
      foundQuestion: !!question,
      questionOptions: question?.options,
      questionOptionsType: typeof question?.options,
      questionOptionsIsArray: Array.isArray(question?.options)
    })
    
    // PENTING: Gunakan question_type dari program study question, bukan dari answer
    const questionType = question?.question_type || answer.question_type
    
    console.log(`🎯 Question type decision - Using: "${questionType}", from question: "${question?.question_type}", from answer: "${answer.question_type}"`)
    
    // Parse options dari question.options (bisa berupa string JSON atau array)
    const parseOptions = (opts: any): any[] => {
      if (!opts) return []
      
      // Jika sudah array, return langsung
      if (Array.isArray(opts)) {
        // Jika array berisi string, convert ke format {id, label}
        return opts.map((opt, idx) => {
          if (typeof opt === 'string') {
            return {
              id: String(idx + 1),
              label: opt
            }
          }
          // Jika sudah object, pastikan ada id dan label
          return {
            id: String(opt.id || opt.value || (idx + 1)),
            label: opt.label || opt.text || opt.value || `Option ${idx + 1}`
          }
        })
      }
      
      // Jika string JSON, parse dulu
      if (typeof opts === 'string') {
        try {
          const parsed = JSON.parse(opts)
          if (Array.isArray(parsed)) {
            return parsed.map((opt, idx) => {
              if (typeof opt === 'string') {
                return {
                  id: String(idx + 1),
                  label: opt
                }
              }
              return {
                id: String(opt.id || opt.value || (idx + 1)),
                label: opt.label || opt.text || opt.value || `Option ${idx + 1}`
              }
            })
          }
        } catch {
          return []
        }
      }
      
      return []
    }
    
    switch (questionType) {
      case "text":
        return {
          id: `pq${idx}`,
          type: "short_answer",
          title: answer.question_text,
          required: question?.is_required || false,
          textAnswer: String(answer.answer_value),
        }

      case "scale":
        return {
          id: `pq${idx}`,
          type: "linear_scale",
          title: answer.question_text,
          required: question?.is_required || false,
          minValue: 1,
          maxValue: 5,
          minLabel: "Sangat Tidak Setuju",
          maxLabel: "Sangat Setuju",
          selectedValue: Number(answer.answer_value),
        }

      case "radio":
      case "multiple_choice":
        // Parse options dari question
        const mcOptionsRaw = parseOptions(question?.options)
        const mcOptions = mcOptionsRaw
        
        console.log(`📻 Program study MC - questionType: ${questionType}, options:`, mcOptions, `answerValue:`, answer.answer_value)
        
        // answer_value bisa berupa object {id, label}, ID, atau label langsung
        let selectedOptionId: string
        if (typeof answer.answer_value === 'object' && answer.answer_value !== null && 'id' in answer.answer_value) {
          selectedOptionId = String((answer.answer_value as any).id)
        } else if (typeof answer.answer_value === 'string') {
          const isNumericId = /^\d+$/.test(answer.answer_value)
          if (isNumericId) {
            selectedOptionId = answer.answer_value
          } else {
            const foundOption = mcOptions.find(opt => opt.label === answer.answer_value)
            selectedOptionId = foundOption ? foundOption.id : String(answer.answer_value)
          }
        } else {
          selectedOptionId = String(answer.answer_value)
        }
        
        console.log(`📻 Program study multiple choice - Selected:`, selectedOptionId)
        
        const result = {
          id: `pq${idx}`,
          type: "multiple_choice" as const,
          title: answer.question_text,
          required: question?.is_required || false,
          options: mcOptions,
          selectedOption: selectedOptionId,
        }
        
        console.log(`✅ Program study MC result:`, result)
        
        return result

      case "checkbox":
        // Parse options dari question
        const cbOptionsRaw = parseOptions(question?.options)
        const cbOptions = cbOptionsRaw
        let selectedIds: string[] = []
        
        if (Array.isArray(answer.answer_value)) {
          if (answer.answer_value.length > 0 && typeof answer.answer_value[0] === 'object' && answer.answer_value[0] !== null && 'id' in answer.answer_value[0]) {
            selectedIds = answer.answer_value.map((item: any) => String(item.id))
          } else if (answer.answer_value.length > 0 && typeof answer.answer_value[0] === 'string') {
            const firstItem = answer.answer_value[0]
            const isNumericId = /^\d+$/.test(firstItem)
            
            if (isNumericId) {
              selectedIds = answer.answer_value.map((id: any) => String(id))
            } else {
              selectedIds = answer.answer_value
                .map((label: string) => {
                  const foundOption = cbOptions.find(opt => opt.label === label)
                  return foundOption ? foundOption.id : null
                })
                .filter((id): id is string => id !== null)
            }
          } else {
            selectedIds = answer.answer_value.map((id: any) => String(id))
          }
        } else if (typeof answer.answer_value === 'string') {
          try {
            const parsed = JSON.parse(answer.answer_value)
            if (Array.isArray(parsed)) {
              if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && 'id' in parsed[0]) {
                selectedIds = parsed.map((item: any) => String(item.id))
              } else if (parsed.length > 0 && typeof parsed[0] === 'string') {
                const firstItem = parsed[0]
                const isNumericId = /^\d+$/.test(firstItem)
                
                if (isNumericId) {
                  selectedIds = parsed.map(String)
                } else {
                  selectedIds = parsed
                    .map((label: string) => {
                      const foundOption = cbOptions.find(opt => opt.label === label)
                      return foundOption ? foundOption.id : null
                    })
                    .filter((id): id is string => id !== null)
                }
              } else {
                selectedIds = parsed.map(String)
              }
            } else {
              selectedIds = [String(parsed)]
            }
          } catch {
            selectedIds = [String(answer.answer_value)]
          }
        } else {
          selectedIds = [String(answer.answer_value)]
        }
        
        console.log(`☑️ Program study checkbox options:`, cbOptions, `Selected:`, selectedIds)
        
        return {
          id: `pq${idx}`,
          type: "checkbox",
          title: answer.question_text,
          required: question?.is_required || false,
          options: cbOptions,
          selectedOptions: selectedIds,
        }

      default:
        return {
          id: `pq${idx}`,
          type: "short_answer",
          title: answer.question_text,
          required: question?.is_required || false,
          textAnswer: String(answer.answer_value),
        }
    }
  }

  const convertAnswerToResponseAnswer = (
    answer: Answer,
    idx: number,
  ): QuestionData => {
    // Cari question yang sesuai untuk mendapatkan options
    const question = questions.find(q => Number(q.id) === answer.question)
    
    console.log(`🔍 Converting answer for question ${answer.question}:`, {
      questionType: answer.question_type,
      answerValue: answer.answer_value,
      answerValueType: typeof answer.answer_value,
      answerValueIsArray: Array.isArray(answer.answer_value),
      foundQuestion: !!question,
      questionOptions: question?.options,
      questionOptionsType: typeof question?.options,
      questionOptionsIsArray: Array.isArray(question?.options)
    })
    
    // Parse options dari question.options (bisa berupa string JSON atau array)
    const parseOptions = (opts: any): any[] => {
      if (!opts) return []
      
      // Jika sudah array, return langsung
      if (Array.isArray(opts)) {
        // Jika array berisi string, convert ke format {id, label}
        return opts.map((opt, idx) => {
          if (typeof opt === 'string') {
            return {
              id: String(idx + 1),
              label: opt
            }
          }
          // Jika sudah object, pastikan ada id dan label
          return {
            id: String(opt.id || opt.value || (idx + 1)),
            label: opt.label || opt.text || opt.value || `Option ${idx + 1}`
          }
        })
      }
      
      // Jika string JSON, parse dulu
      if (typeof opts === 'string') {
        try {
          const parsed = JSON.parse(opts)
          if (Array.isArray(parsed)) {
            return parsed.map((opt, idx) => {
              if (typeof opt === 'string') {
                return {
                  id: String(idx + 1),
                  label: opt
                }
              }
              return {
                id: String(opt.id || opt.value || (idx + 1)),
                label: opt.label || opt.text || opt.value || `Option ${idx + 1}`
              }
            })
          }
        } catch {
          return []
        }
      }
      
      return []
    }
    
    switch (answer.question_type) {
      case "text":
        return {
          id: `q${idx}`,
          type: "short_answer",
          title: answer.question_text,
          required: question?.is_required || false,
          textAnswer: String(answer.answer_value),
        }

      case "scale":
        return {
          id: `q${idx}`,
          type: "linear_scale",
          title: answer.question_text,
          required: question?.is_required || false,
          minValue: 1,
          maxValue: 5,
          minLabel: "Sangat Tidak Setuju",
          maxLabel: "Sangat Setuju",
          selectedValue: Number(answer.answer_value),
        }

      case "radio":
      case "multiple_choice":
        // Parse options dari question
        const mcOptionsRaw = parseOptions(question?.options)
        
        // Options sudah dalam format {id, label} dari parseOptions
        const mcOptions = mcOptionsRaw
        
        // answer_value bisa berupa object {id, label}, ID, atau label langsung
        let selectedOptionId: string
        if (typeof answer.answer_value === 'object' && answer.answer_value !== null && 'id' in answer.answer_value) {
          // Format: {"id": "1", "label": "Male"}
          selectedOptionId = String((answer.answer_value as any).id)
        } else if (typeof answer.answer_value === 'string') {
          // Cek apakah string adalah ID (angka) atau label
          const isNumericId = /^\d+$/.test(answer.answer_value)
          if (isNumericId) {
            // Format: "1"
            selectedOptionId = answer.answer_value
          } else {
            // Format: "Male" - cari ID berdasarkan label
            const foundOption = mcOptions.find(opt => opt.label === answer.answer_value)
            selectedOptionId = foundOption ? foundOption.id : String(answer.answer_value)
          }
        } else {
          // Format: 1 (number)
          selectedOptionId = String(answer.answer_value)
        }
        
        console.log(`📻 Multiple choice options:`, mcOptions, `Selected:`, selectedOptionId)
        
        return {
          id: `q${idx}`,
          type: "multiple_choice",
          title: answer.question_text,
          required: question?.is_required || false,
          options: mcOptions,
          selectedOption: selectedOptionId,
        }

      case "checkbox":
        // Parse options dari question
        const cbOptionsRaw = parseOptions(question?.options)
        
        // Options sudah dalam format {id, label} dari parseOptions
        const cbOptions = cbOptionsRaw
        let selectedIds: string[] = []
        
        if (Array.isArray(answer.answer_value)) {
          // Cek apakah array berisi objects dengan struktur {id, label}
          if (answer.answer_value.length > 0 && typeof answer.answer_value[0] === 'object' && answer.answer_value[0] !== null && 'id' in answer.answer_value[0]) {
            // Format: [{"id": "1", "label": "testesdasddads"}, {"id": "3", "label": "Option3"}]
            selectedIds = answer.answer_value.map((item: any) => String(item.id))
          } else if (answer.answer_value.length > 0 && typeof answer.answer_value[0] === 'string') {
            // Cek apakah string adalah angka (ID) atau label
            const firstItem = answer.answer_value[0]
            const isNumericId = /^\d+$/.test(firstItem)
            
            if (isNumericId) {
              // Format: ["1", "3"] - array of IDs
              selectedIds = answer.answer_value.map((id: any) => String(id))
            } else {
              // Format: ["Reading", "Music"] - array of labels
              // Cari ID berdasarkan label yang cocok
              selectedIds = answer.answer_value
                .map((label: string) => {
                  const foundOption = cbOptions.find(opt => opt.label === label)
                  return foundOption ? foundOption.id : null
                })
                .filter((id): id is string => id !== null)
            }
          } else {
            // Format: [1, 3] - array of numeric IDs
            selectedIds = answer.answer_value.map((id: any) => String(id))
          }
        } else if (typeof answer.answer_value === 'string') {
          try {
            const parsed = JSON.parse(answer.answer_value)
            if (Array.isArray(parsed)) {
              // Cek apakah array berisi objects
              if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && 'id' in parsed[0]) {
                selectedIds = parsed.map((item: any) => String(item.id))
              } else if (parsed.length > 0 && typeof parsed[0] === 'string') {
                const firstItem = parsed[0]
                const isNumericId = /^\d+$/.test(firstItem)
                
                if (isNumericId) {
                  selectedIds = parsed.map(String)
                } else {
                  // Array of labels
                  selectedIds = parsed
                    .map((label: string) => {
                      const foundOption = cbOptions.find(opt => opt.label === label)
                      return foundOption ? foundOption.id : null
                    })
                    .filter((id): id is string => id !== null)
                }
              } else {
                selectedIds = parsed.map(String)
              }
            } else {
              selectedIds = [String(parsed)]
            }
          } catch {
            // Jika bukan JSON, anggap sebagai single value
            selectedIds = [String(answer.answer_value)]
          }
        } else {
          selectedIds = [String(answer.answer_value)]
        }
        
        console.log(`☑️ Checkbox options:`, cbOptions, `Selected:`, selectedIds)
        
        return {
          id: `q${idx}`,
          type: "checkbox",
          title: answer.question_text,
          required: question?.is_required || false,
          options: cbOptions,
          selectedOptions: selectedIds,
        }

      default:
        return {
          id: `q${idx}`,
          type: "short_answer",
          title: answer.question_text,
          required: question?.is_required || false,
          textAnswer: String(answer.answer_value),
        }
    }
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500">Loading...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <Breadcrumb>
            <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/survey">Survey Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{surveyTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <QuestionToolbar
          title={`${surveyTitle}`}
          activeTab="responses"
          surveyId={surveyId.toString()}
          programStudyId={programStudyId}
          onPublish={() => console.log("Publish")}
        />

        <div className="bg-gray-50 min-h-screen">
          {/* Navigation */}
          <div className="bg-white border-b shadow-sm px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select
                  value={currentUserNim}
                  onValueChange={handleUserChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select response" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((user) => (
                      <SelectItem key={user.nim} value={user.nim}>
                        {user.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentIndex <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-900">
                    {currentIndex} dari {allUsers.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentIndex >= allUsers.length}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="gap-2"
                  disabled={isDeleting || userAnswers.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Question Cards */}
          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {userAnswers.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  Tidak ada jawaban
                </p>
              ) : (
                <>
                  {/* Render sections with their questions */}
                  {sectionsWithQuestions.map((sectionData, sectionIdx) => {
                    // Filter answers for this section
                    const sectionAnswers = userAnswers.filter(answer => 
                      sectionData.questions.some(q => Number(q.id) === answer.question)
                    )
                    
                    if (sectionAnswers.length === 0) return null
                    
                    return (
                      <div key={sectionData.section.id} className="space-y-3">
                        <SectionHeaderCard
                          sectionNumber={sectionIdx + 1}
                          totalSections={sectionsWithQuestions.length}
                          title={sectionData.section.title}
                          description={sectionData.section.description || ""}
                          sectionId={sectionData.section.id}
                          sectionOrder={sectionData.section.order}
                        />
                        
                        {sectionAnswers.map((answer, idx) => (
                          <QuestionCardGForm
                            key={answer.id}
                            question={convertAnswerToResponseAnswer(answer, idx + 1)}
                            isEditMode={false}
                          />
                        ))}
                      </div>
                    )
                  })}
                  
                  {/* Render program study questions */}
                  {programStudyQuestions.length > 0 && (() => {
                    const programAnswers = userAnswers.filter(answer => 
                      answer.program_specific_question !== null
                    )
                    
                    if (programAnswers.length === 0) return null
                    
                    return (
                      <div className="space-y-3 mt-6">
                        <div className="bg-white rounded-lg shadow-sm border-t-[8px] border-primary p-6">
                          <h2 className="text-xl text-gray-900">Program Study Question</h2>
                          <p className="text-sm text-gray-500 mt-1">Pertanyaan khusus untuk program studi</p>
                        </div>
                        
                        {programAnswers.map((answer, idx) => (
                          <QuestionCardGForm
                            key={answer.id}
                            question={convertProgramStudyAnswerToResponseAnswer(answer, idx + 1)}
                            isEditMode={false}
                          />
                        ))}
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
