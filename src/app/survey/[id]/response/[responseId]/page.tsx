"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionCardGForm, QuestionData } from "@/components/question_card_gform"
import { QuestionToolbar } from "@/components/question_toolbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
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
import { Answer, deleteAnswer, getAnswers, getQuestions, getSections, Question } from "@/lib/api"
import { ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface UniqueUser {
  id: string     
  nama: string
  nim: string
}

export default function ResponseDetailPage() {
  const params = useParams()
  const surveyId = Number(params?.id)

  const [allUsers, setAllUsers] = useState<UniqueUser[]>([])
  const [currentUserNim, setCurrentUserNim] = useState<string>("")
  const [userAnswers, setUserAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setIsLoading(true)

        if (!surveyId || isNaN(surveyId)) {
          throw new Error("Invalid survey ID")
        }

        // Fetch semua sections
        const sections = await getSections(surveyId)
        
        // Fetch questions dari setiap section
        const allQuestions: Question[] = []
        for (const section of sections) {
          const sectionQuestions = await getQuestions(surveyId, section.id)
          allQuestions.push(...sectionQuestions)
        }
        
        setQuestions(allQuestions)
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

  const convertAnswerToResponseAnswer = (
    answer: Answer,
    idx: number,
  ): QuestionData => {
    // Cari question yang sesuai untuk mendapatkan options
    const question = questions.find(q => Number(q.id) === answer.question)
    
    console.log(`🔍 Converting answer for question ${answer.question}:`, {
      questionType: answer.question_type,
      answerValue: answer.answer_value,
      foundQuestion: !!question,
      questionOptions: question?.options
    })
    
    // Parse options dari question.options (bisa berupa string JSON atau array)
    const parseOptions = (opts: any): any[] => {
      if (!opts) return []
      
      // Jika sudah array, return langsung
      if (Array.isArray(opts)) return opts
      
      // Jika string JSON, parse dulu
      if (typeof opts === 'string') {
        try {
          const parsed = JSON.parse(opts)
          return Array.isArray(parsed) ? parsed : []
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
        
        // Map options dengan ID yang benar (dimulai dari 1)
        const mcOptions = mcOptionsRaw.map((opt: any, optIdx: number) => ({
          id: String(opt.id || opt.value || (optIdx + 1)),
          label: opt.label || opt.text || opt.value || `Option ${optIdx + 1}`
        }))
        
        // answer_value bisa berupa object {id, label} atau langsung ID
        let selectedOptionId: string
        if (typeof answer.answer_value === 'object' && answer.answer_value !== null && 'id' in answer.answer_value) {
          selectedOptionId = String((answer.answer_value as any).id)
        } else {
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
        
        // Parse answer_value untuk mendapatkan options yang sudah ada labelnya
        let cbOptions: any[] = []
        let selectedIds: string[] = []
        
        if (Array.isArray(answer.answer_value)) {
          // Cek apakah array berisi objects dengan struktur {id, label}
          if (answer.answer_value.length > 0 && typeof answer.answer_value[0] === 'object' && answer.answer_value[0].id) {
            // Format: [{"id": "1", "label": "testesdasddads"}, {"id": "3", "label": "Option3"}]
            // answer_value SUDAH mengandung label yang benar dari database!
            const answerOptions = answer.answer_value.map((item: any) => ({
              id: String(item.id),
              label: item.label
            }))
            
            // Ambil semua options dari question, tapi override dengan label dari answer_value
            const questionOptions = cbOptionsRaw.map((opt: any, optIdx: number) => ({
              id: String(opt.id || opt.value || (optIdx + 1)),
              label: opt.label || opt.text || opt.value || `Option ${optIdx + 1}`
            }))
            
            // Merge: gunakan label dari answer_value jika ada, fallback ke question options
            const answerMap = new Map(answerOptions.map(o => [o.id, o.label]))
            cbOptions = questionOptions.map(opt => ({
              id: opt.id,
              label: answerMap.get(opt.id) || opt.label
            }))
            
            selectedIds = answerOptions.map((item: any) => String(item.id))
          } else {
            // Format: ["1", "3"] atau [1, 3]
            cbOptions = cbOptionsRaw.map((opt: any, optIdx: number) => ({
              id: String(opt.id || opt.value || (optIdx + 1)),
              label: opt.label || opt.text || opt.value || `Option ${optIdx + 1}`
            }))
            selectedIds = answer.answer_value.map((id: any) => String(id))
          }
        } else if (typeof answer.answer_value === 'string') {
          try {
            const parsed = JSON.parse(answer.answer_value)
            if (Array.isArray(parsed)) {
              // Cek apakah array berisi objects
              if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0].id) {
                const answerOptions = parsed.map((item: any) => ({
                  id: String(item.id),
                  label: item.label
                }))
                
                const questionOptions = cbOptionsRaw.map((opt: any, optIdx: number) => ({
                  id: String(opt.id || opt.value || (optIdx + 1)),
                  label: opt.label || opt.text || opt.value || `Option ${optIdx + 1}`
                }))
                
                const answerMap = new Map(answerOptions.map(o => [o.id, o.label]))
                cbOptions = questionOptions.map(opt => ({
                  id: opt.id,
                  label: answerMap.get(opt.id) || opt.label
                }))
                
                selectedIds = answerOptions.map((item: any) => String(item.id))
              } else {
                cbOptions = cbOptionsRaw.map((opt: any, optIdx: number) => ({
                  id: String(opt.id || opt.value || (optIdx + 1)),
                  label: opt.label || opt.text || opt.value || `Option ${optIdx + 1}`
                }))
                selectedIds = parsed.map(String)
              }
            } else {
              cbOptions = cbOptionsRaw.map((opt: any, optIdx: number) => ({
                id: String(opt.id || opt.value || (optIdx + 1)),
                label: opt.label || opt.text || opt.value || `Option ${optIdx + 1}`
              }))
              selectedIds = [String(answer.answer_value)]
            }
          } catch {
            cbOptions = cbOptionsRaw.map((opt: any, optIdx: number) => ({
              id: String(opt.id || opt.value || (optIdx + 1)),
              label: opt.label || opt.text || opt.value || `Option ${optIdx + 1}`
            }))
            selectedIds = [String(answer.answer_value)]
          }
        } else {
          cbOptions = cbOptionsRaw.map((opt: any, optIdx: number) => ({
            id: String(opt.id || opt.value || (optIdx + 1)),
            label: opt.label || opt.text || opt.value || `Option ${optIdx + 1}`
          }))
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
                <BreadcrumbPage>Survey {surveyId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <QuestionToolbar
          title={`Survey ${surveyId}`}
          activeTab="responses"
          surveyId={surveyId.toString()}
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
                  onClick={() => console.log("Export")}
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
                userAnswers.map((answer, idx) => (
                  <QuestionCardGForm
                    key={answer.id}
                    question={convertAnswerToResponseAnswer(answer, idx + 1)}
                    isEditMode={false}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
