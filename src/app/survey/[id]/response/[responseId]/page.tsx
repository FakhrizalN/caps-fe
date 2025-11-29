"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionToolbar } from "@/components/question_toolbar"
import {
  ResponseAnswer,
  ResponseAnswerCard,
} from "@/components/response_answer_card"
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
import { Answer, deleteAnswer, getAnswers } from "@/lib/api"
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
  ): ResponseAnswer => {
    switch (answer.question_type) {
      case "text":
        return {
          id: `q${idx}`,
          type: "short_answer",
          title: answer.question_text,
          required: true,
          textAnswer: String(answer.answer_value),
        }

      case "scale":
        return {
          id: `q${idx}`,
          type: "linear_scale",
          title: answer.question_text,
          required: true,
          minValue: 1,
          maxValue: 5,
          minLabel: "Sangat Tidak Setuju",
          maxLabel: "Sangat Setuju",
          selectedValue: Number(answer.answer_value),
        }

      case "multiple_choice":
        return {
          id: `q${idx}`,
          type: "multiple_choice",
          title: answer.question_text,
          required: true,
          options: [{ id: "opt1", label: String(answer.answer_value) }],
          selectedOption: "opt1",
        }

      case "checkbox":
        return {
          id: `q${idx}`,
          type: "checkbox",
          title: answer.question_text,
          required: true,
          options: Array.isArray(answer.answer_value)
            ? answer.answer_value.map((val, i) => ({
                id: `opt${i}`,
                label: String(val),
              }))
            : [{ id: "opt1", label: String(answer.answer_value) }],
          selectedOptions: Array.isArray(answer.answer_value)
            ? answer.answer_value.map((_, i) => `opt${i}`)
            : ["opt1"],
        }

      default:
        return {
          id: `q${idx}`,
          type: "short_answer",
          title: answer.question_text,
          required: true,
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
                  <ResponseAnswerCard
                    key={answer.id}
                    answer={convertAnswerToResponseAnswer(answer, idx + 1)}
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
