"use client";

import { ResponseAnswerCard, type ResponseAnswer } from "@/components/response_answer_card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  getQuestionsPublic,
  getSectionsPublic,
  getSurveyPublic,
  type Section,
  type Survey
} from "@/lib/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Get base URL for API calls
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return 'https://tracer.neverlands.xyz';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://tracer.neverlands.xyz';
}

// Helper function to convert text formatting to HTML
function formatText(text: string): string {
  if (!text) return text;
  
  let formatted = text;
  
  // Handle combined formatting tags
  formatted = formatted.replace(/<b><i><u>(.*?)<\/u><\/i><\/b>/g, '<strong><em><u>$1</u></em></strong>');
  formatted = formatted.replace(/<b><i>(.*?)<\/i><\/b>/g, '<strong><em>$1</em></strong>');
  formatted = formatted.replace(/<b><u>(.*?)<\/u><\/b>/g, '<strong><u>$1</u></strong>');
  formatted = formatted.replace(/<i><u>(.*?)<\/u><\/i>/g, '<em><u>$1</u></em>');
  
  // Handle single formatting tags
  formatted = formatted.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
  formatted = formatted.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');
  
  return formatted;
}

function mapQuestionType(backendType: string): ResponseAnswer['type'] {
  const typeMap: Record<string, ResponseAnswer['type']> = {
    'radio': 'multiple_choice',
    'checkbox': 'checkbox',
    'text': 'short_answer',
    'number': 'short_answer',
    'paragraph': 'paragraph',
    'scale': 'linear_scale',
    'dropdown': 'dropdown',
  };
  
  return typeMap[backendType] || 'short_answer';
}

interface SectionWithQuestions extends Section {
  questions: ResponseAnswer[];
}

export default function SupervisorSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = Number(params.id);
  const token = searchParams.get('token');
  
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [sectionsWithQuestions, setSectionsWithQuestions] = useState<SectionWithQuestions[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const [answers, setAnswers] = useState<Record<string, ResponseAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token is provided
    if (!token) {
      setTokenError('Token tidak ditemukan. Silakan gunakan link dari email Anda.');
      setLoading(false);
      return;
    }

    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        
        // Fetch survey using public endpoint (no auth)
        const survey = await getSurveyPublic(String(surveyId));
        setSurveyData(survey);
        
        // Fetch sections using public endpoint (no auth)
        const sectionsData = await getSectionsPublic(surveyId);
        
        if (sectionsData.length === 0) {
          throw new Error("Survey tidak memiliki section");
        }
        
        // Fetch questions per section using public endpoint
        const sectionsWithQuestionsData: SectionWithQuestions[] = [];
        
        for (const section of sectionsData) {
          const questionsData = await getQuestionsPublic(surveyId, section.id);
          
          // Transform questions to ResponseAnswer format
          const transformedQuestions: ResponseAnswer[] = questionsData.map(q => {
            let options = q.options;
            let minValue = 1;
            let maxValue = 5;
            let minLabel = "Sangat Tidak Setuju";
            let maxLabel = "Sangat Setuju";
            
            if (typeof options === 'string') {
              try {
                options = JSON.parse(options);
              } catch (e) {
                options = [];
              }
            }
            
            // For linear scale questions, extract min/max data from options
            let formattedOptions: Array<{ id: string; label: string }> = [];
            if (q.question_type === 'scale' && options && typeof options === 'object' && !Array.isArray(options)) {
              minValue = options.minValue ?? 1;
              maxValue = options.maxValue ?? 5;
              minLabel = formatText(options.minLabel ?? "Sangat Tidak Setuju");
              maxLabel = formatText(options.maxLabel ?? "Sangat Setuju");
            }
            // Transform options format to {id, label}
            else if (Array.isArray(options)) {
              formattedOptions = options.map((opt, idx) => {
                if (typeof opt === 'string') {
                  return { id: String(idx + 1), label: formatText(opt) };
                }
                if (opt && typeof opt === 'object' && opt.label) {
                  return {
                    id: opt.id || String(idx + 1),
                    label: formatText(opt.label),
                    navigation: opt.navigation
                  };
                }
                return { id: String(idx + 1), label: formatText(String(opt)) };
              });
            }
            
            return {
              id: String(q.id),
              type: mapQuestionType(q.question_type),
              title: formatText(q.text),
              description: formatText(q.description || ""),
              required: q.is_required,
              options: formattedOptions,
              branches: q.branches || [],
              minValue,
              maxValue,
              minLabel,
              maxLabel
            };
          });
          
          sectionsWithQuestionsData.push({
            ...section,
            questions: transformedQuestions
          });
        }
        
        setSectionsWithQuestions(sectionsWithQuestionsData);
        
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat survey");
      } finally {
        setLoading(false);
      }
    };

    if (surveyId && !isNaN(surveyId)) {
      fetchSurveyData();
    } else {
      toast.error("ID Survey tidak valid");
      setLoading(false);
    }
  }, [surveyId, token]);

  const handleUpdateAnswer = (updatedAnswer: ResponseAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [updatedAnswer.id]: updatedAnswer
    }));
  };

  const handleNext = () => {
    // Validate current section questions
    const currentSection = sectionsWithQuestions[currentSectionIndex];
    const requiredQuestions = currentSection.questions.filter(q => q.required);
    
    const unansweredRequired = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      if (!answer) return true;
      
      if (answer.type === 'multiple_choice') {
        return !answer.selectedOption;
      }
      if (answer.type === 'checkbox') {
        return !answer.selectedOptions || answer.selectedOptions.length === 0;
      }
      if (answer.type === 'short_answer' || answer.type === 'paragraph') {
        return !answer.textAnswer || answer.textAnswer.trim() === '';
      }
      if (answer.type === 'linear_scale') {
        return !answer.selectedValue;
      }
      if (answer.type === 'dropdown') {
        return !answer.selectedOption;
      }
      
      return false;
    });
    
    if (unansweredRequired.length > 0) {
      toast.warning(`Mohon jawab semua pertanyaan yang wajib diisi (${unansweredRequired.length} pertanyaan belum dijawab)`);
      return;
    }
    
    // Check for branch navigation
    let targetSectionIndex = -1;
    
    for (const question of currentSection.questions) {
      if (question.type === 'multiple_choice' && question.branches && question.branches.length > 0) {
        const answer = answers[question.id];
        if (answer?.selectedOption) {
          const selectedOption = question.options?.find(opt => opt.id === answer.selectedOption);
          if (selectedOption) {
            const branch = question.branches.find(b => b.answer_value === selectedOption.label);
            if (branch) {
              const targetIndex = sectionsWithQuestions.findIndex(s => s.id === branch.next_section);
              if (targetIndex !== -1) {
                targetSectionIndex = targetIndex;
                break;
              }
            }
          }
        }
      }
    }
    
    // Navigate based on branch logic or sequential order
    if (targetSectionIndex !== -1) {
      setCurrentSectionIndex(targetSectionIndex);
      setNavigationHistory(prev => [...prev, targetSectionIndex]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentSectionIndex < sectionsWithQuestions.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      setNavigationHistory(prev => [...prev, nextIndex]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      
      const previousIndex = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentSectionIndex(previousIndex);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error('Token tidak ditemukan');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Collect all questions from all sections
      const allQuestions: ResponseAnswer[] = [];
      
      sectionsWithQuestions.forEach(section => {
        section.questions.forEach(q => {
          allQuestions.push(q);
        });
      });
      
      // Format answers for supervisor endpoint
      // Note: Backend expects question_id, not question
      const formattedAnswers = allQuestions.map(question => {
        const answer = answers[question.id];
        const questionId = Number(question.id);
        
        let answerValue: any;
        
        if (!answer) {
          // Question was skipped - send default value
          if (question.type === 'checkbox') {
            answerValue = JSON.stringify([]);
          } else {
            answerValue = "-";
          }
        } else {
          // Process the answer based on type
          if (answer.type === 'multiple_choice' || answer.type === 'dropdown') {
            const selectedOptionId = answer.selectedOption || "";
            const option = question.options?.find(opt => opt.id === selectedOptionId);
            answerValue = option?.label || selectedOptionId;
          } else if (answer.type === 'checkbox') {
            const selectedIds = answer.selectedOptions || [];
            const selectedLabels = selectedIds.map(id => {
              const option = question.options?.find(opt => opt.id === id);
              return option?.label || id;
            });
            answerValue = JSON.stringify(selectedLabels);
          } else if (answer.type === 'short_answer' || answer.type === 'paragraph') {
            answerValue = answer.textAnswer || "";
          } else if (answer.type === 'linear_scale') {
            answerValue = answer.selectedValue || 0;
          } else {
            answerValue = "";
          }
        }
        
        return {
          question_id: questionId,
          answer_value: answerValue
        };
      });

      // Submit with token as query parameter
      const BASE_URL = getBaseUrl();
      const response = await fetch(`${BASE_URL}/api/surveys/supervisor/${surveyId}/answers/bulk?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Gagal mengirim jawaban: ${response.status}`);
      }
      
      toast.success('Survey berhasil disubmit! Terima kasih atas partisipasi Anda.');
      setTimeout(() => router.push('/'), 1500);
      
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err instanceof Error ? err.message : 'Gagal mengirim jawaban. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error if no token
  if (tokenError) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 min-h-screen py-8 px-4">
        <Card className="border-t-8 border-t-red-500 shadow-sm">
          <CardContent className="pt-6 pb-4 space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900">Error</h1>
            <p className="text-gray-600">{tokenError}</p>
            <Button onClick={() => router.push('/')}>
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 min-h-screen py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="mb-4" />
          <p className="text-gray-600">Memuat survey...</p>
        </div>
      </div>
    );
  }

  // Determine current page content
  const currentSection = sectionsWithQuestions[currentSectionIndex];
  const currentQuestions = currentSection?.questions || [];
  const sectionTitle = currentSection?.title ? formatText(currentSection.title) : "";
  const isLastSection = currentSectionIndex === sectionsWithQuestions.length - 1;

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 min-h-screen py-8 px-4">
      {/* Header Survey */}
      <Card className="border-t-8 border-t-primary shadow-sm mb-6">
        <CardContent className="pt-6 pb-4 space-y-2">
          <h1 
            className="text-3xl font-normal text-gray-900"
            dangerouslySetInnerHTML={{ __html: formatText(surveyData?.title || "Survey") }}
          />
          {surveyData?.description && (
            <p 
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: formatText(surveyData.description) }}
            />
          )}
        </CardContent>
      </Card>

      {/* Section Title Card - Only show after first section */}
      {currentSectionIndex > 0 && (
        <Card className="border-t-4 border-t-primary shadow-sm mb-6">
          <CardContent className="pt-4 pb-4">
            <h2 
              className="text-xl font-medium text-gray-900"
              dangerouslySetInnerHTML={{ __html: sectionTitle || "Section" }}
            />
            {currentSection?.description && (
              <p 
                className="text-sm text-gray-600 mt-2"
                dangerouslySetInnerHTML={{ __html: formatText(currentSection.description) }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions in Current Section */}
      <div className="space-y-6">
        {currentQuestions.map((question) => (
          <ResponseAnswerCard
            key={question.id}
            answer={answers[question.id] || question}
            isReadOnly={false}
            onUpdate={handleUpdateAnswer}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 pb-8 flex justify-between">
        <Button 
          size="lg"
          variant="outline"
          onClick={handleBack}
          disabled={navigationHistory.length <= 1 || isSubmitting}
        >
          Kembali
        </Button>
        
        <Button 
          size="lg"
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Mengirim...
            </>
          ) : (
            <>
              {isLastSection ? "Kirim" : "Lanjut"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
