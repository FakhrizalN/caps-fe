"use client";

import { ResponseAnswerCard, type ResponseAnswer } from "@/components/response_answer_card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  getCurrentUser,
  getProgramStudyQuestions,
  getQuestions,
  getSections,
  getSurvey,
  submitBulkAnswers,
  type CreateAnswerData,
  type Section,
  type Survey
} from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function AlumniAnswerPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = Number(params.id);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [sectionsWithQuestions, setSectionsWithQuestions] = useState<SectionWithQuestions[]>([]);
  const [programStudyQuestions, setProgramStudyQuestions] = useState<ResponseAnswer[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ResponseAnswer>>({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        
        console.log("=== START FETCHING ===");
        console.log("Survey ID:", surveyId);
        
        // Fetch survey
        const survey = await getSurvey(String(surveyId));
        console.log("✅ Survey:", survey);
        setSurveyData(survey);
        
        // Fetch sections
        const sectionsData = await getSections(surveyId);
        console.log("✅ Sections:", sectionsData);
        
        if (sectionsData.length === 0) {
          throw new Error("Survey tidak memiliki section");
        }
        
        // Fetch questions per section dan group by section
        const sectionsWithQuestionsData: SectionWithQuestions[] = [];
        
        for (const section of sectionsData) {
          const questionsData = await getQuestions(surveyId, section.id);
          console.log(`✅ Questions for section ${section.id}:`, questionsData);
          
          // Transform questions ke format ResponseAnswer
          const transformedQuestions: ResponseAnswer[] = questionsData.map(q => {
            let options = q.options;
            
            if (typeof options === 'string') {
              try {
                options = JSON.parse(options);
              } catch (e) {
                console.error(`Failed to parse options for question ${q.id}:`, e);
                options = [];
              }
            }
            
            // Transform options format ke {id, label}
            let formattedOptions: Array<{ id: string; label: string }> = [];
            if (Array.isArray(options)) {
              formattedOptions = options.map((opt, idx) => {
                if (typeof opt === 'string') {
                  return { id: String(idx + 1), label: opt };
                }
                if (opt && typeof opt === 'object' && opt.label) {
                  return { id: opt.id || String(idx + 1), label: opt.label };
                }
                return { id: String(idx + 1), label: String(opt) };
              });
            }
            
            return {
              id: String(q.id),
              type: mapQuestionType(q.question_type),
              title: q.text,
              description: q.description || "",
              required: q.is_required,
              options: formattedOptions,
              minValue: 1,
              maxValue: 5,
              minLabel: "Sangat Tidak Setuju",
              maxLabel: "Sangat Setuju"
            };
          });
          
          sectionsWithQuestionsData.push({
            ...section,
            questions: transformedQuestions
          });
        }
        
        console.log("✅ Sections with questions:", sectionsWithQuestionsData);
        setSectionsWithQuestions(sectionsWithQuestionsData);
        
        // Get program study ID from user localStorage (from JWT token)
        const user = getCurrentUser();
        console.log("📋 Current user from localStorage:", user);
        console.log("📋 User program_study ID:", user?.program_study);
        
        if (user?.program_study) {
          try {
            console.log(`🔍 Fetching program study questions for survey: ${surveyId}, program: ${user.program_study}`);
            console.log(`🔍 API endpoint: /api/surveys/${surveyId}/programs/${user.program_study}/questions/`);
            const programStudyQuestionsData = await getProgramStudyQuestions(surveyId, user.program_study);
            console.log("✅ Program study questions response:", programStudyQuestionsData);
            console.log("✅ Response type:", typeof programStudyQuestionsData);
            console.log("✅ Is array:", Array.isArray(programStudyQuestionsData));
            console.log("✅ Length:", programStudyQuestionsData?.length);
            
            // Check if response is array and has items
            if (Array.isArray(programStudyQuestionsData) && programStudyQuestionsData.length > 0) {
              console.log(`✅ Found ${programStudyQuestionsData.length} program study questions`);
              // Transform program study questions ke format ResponseAnswer
              const transformedProgramQuestions: ResponseAnswer[] = programStudyQuestionsData.map(q => {
                let options = q.options;
                
                if (typeof options === 'string') {
                  try {
                    options = JSON.parse(options);
                  } catch (e) {
                    console.error(`Failed to parse options for program question ${q.id}:`, e);
                    options = [];
                  }
                }
                
                // Transform options format ke {id, label}
                let formattedOptions: Array<{ id: string; label: string }> = [];
                if (Array.isArray(options)) {
                  formattedOptions = options.map((opt, idx) => {
                    if (typeof opt === 'string') {
                      return { id: String(idx + 1), label: opt };
                    }
                    if (opt && typeof opt === 'object' && opt.label) {
                      return { id: opt.id || String(idx + 1), label: opt.label };
                    }
                    return { id: String(idx + 1), label: String(opt) };
                  });
                }
                
                return {
                  id: `ps-${q.id}`,
                  type: mapQuestionType(q.question_type),
                  title: q.text,
                  description: q.description || "",
                  required: q.is_required,
                  options: formattedOptions,
                  minValue: 1,
                  maxValue: 5,
                  minLabel: "Sangat Tidak Setuju",
                  maxLabel: "Sangat Setuju"
                };
              });
              
              console.log("✅ Transformed program study questions:", transformedProgramQuestions.length, "questions");
              setProgramStudyQuestions(transformedProgramQuestions);
            } else {
              console.log("ℹ️ No program study questions found for this survey/program");
              console.log("ℹ️ Response data:", programStudyQuestionsData);
              setProgramStudyQuestions([]);
            }
          } catch (error) {
            console.warn("⚠️ Failed to fetch program study questions:", error);
            if (error instanceof Error) {
              console.warn("Error details:", {
                message: error.message,
                name: error.name,
                stack: error.stack
              });
            }
            // Program study questions are optional, continue without them
            // Don't show error to user, just log it
            setProgramStudyQuestions([]);
          }
        } else {
          console.log("ℹ️ No program_study found in user data, skipping program study questions");
          setProgramStudyQuestions([]);
        }
        
        console.log("=== FETCHING COMPLETE ===");
        
      } catch (err) {
        console.error("❌ ERROR:", err);
        toast.error(err instanceof Error ? err.message : "Failed to load survey");
      } finally {
        setLoading(false);
      }
    };

    if (surveyId && !isNaN(surveyId)) {
      fetchSurveyData();
    } else {
      toast.error("Invalid survey ID");
      setLoading(false);
    }
  }, [surveyId]);

  const handleUpdateAnswer = (updatedAnswer: ResponseAnswer) => {
    console.log(" Answer updated:", updatedAnswer);
    setAnswers(prev => ({
      ...prev,
      [updatedAnswer.id]: updatedAnswer
    }));
  };

  const handleNext = () => {
    // Determine if we're on the last page (program study questions)
    const isLastPage = currentSectionIndex === sectionsWithQuestions.length;
    
    if (isLastPage) {
      // Validasi program study questions
      const requiredProgramQuestions = programStudyQuestions.filter(q => q.required);
      
      const unansweredRequired = requiredProgramQuestions.filter(q => {
        const answer = answers[q.id];
        if (!answer) return true;
        
        // Cek berdasarkan type
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
      
      handleSubmit();
    } else {
      // Validasi regular section questions
      const currentSection = sectionsWithQuestions[currentSectionIndex];
      const requiredQuestions = currentSection.questions.filter(q => q.required);
      
      const unansweredRequired = requiredQuestions.filter(q => {
        const answer = answers[q.id];
        if (!answer) return true;
        
        // Cek berdasarkan type
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
      
      // Pindah ke section berikutnya atau ke program study questions
      if (currentSectionIndex < sectionsWithQuestions.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (programStudyQuestions.length > 0) {
        // Pindah ke program study questions page
        setCurrentSectionIndex(sectionsWithQuestions.length);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      console.log("📤 Submitting answers:", answers);
    
      // Kirim jawaban ke backend
      const formattedAnswers: CreateAnswerData[] = Object.values(answers).map(answer => {
        let answerValue: any;
        
        // Determine if this is a program study question or regular question
        const isProgramStudyQuestion = answer.id.toString().startsWith('ps-');
        const questionId = isProgramStudyQuestion 
          ? Number(answer.id.toString().replace('ps-', ''))
          : Number(answer.id);
        
        if (answer.type === 'multiple_choice' || answer.type === 'dropdown') {
          // Find the actual option label/value instead of just ID
          const selectedOptionId = answer.selectedOption || "";
          const option = answer.options?.find(opt => opt.id === selectedOptionId);
          // Send the label as the answer value (backend expects the actual text)
          answerValue = option?.label || selectedOptionId;
        } else if (answer.type === 'checkbox') {
          // Map selected option IDs to their labels
          const selectedIds = answer.selectedOptions || [];
          const selectedLabels = selectedIds.map(id => {
            const option = answer.options?.find(opt => opt.id === id);
            return option?.label || id;
          });
          // Send array of labels
          answerValue = selectedLabels;
        } else if (answer.type === 'short_answer' || answer.type === 'paragraph') {
          answerValue = answer.textAnswer || "";
        } else if (answer.type === 'linear_scale') {
          answerValue = answer.selectedValue || 0;
        } else {
          answerValue = "";
        }
        
        // For program study questions, use program_specific_question field
        // For regular questions, use question field
        return {
          survey: surveyId,
          question: isProgramStudyQuestion ? undefined : questionId,
          answer_value: answerValue,
          program_specific_question: isProgramStudyQuestion ? questionId : undefined
        } as CreateAnswerData;
      });
    
      console.log("📤 Formatted answers for API:", formattedAnswers);
      console.log("📤 First answer sample:", JSON.stringify(formattedAnswers[0], null, 2));

      await toast.promise(
        submitBulkAnswers(surveyId, formattedAnswers),
        {
          loading: 'Mengirim jawaban...',
          success: () => {
            setTimeout(() => router.push('/'), 1000);
            return 'Survey berhasil disubmit! Terima kasih atas partisipasi Anda.';
          },
          error: (err) => {
            console.error("❌ Submit error details:", err);
            return err instanceof Error ? err.message : 'Gagal mengirim jawaban. Silakan coba lagi.';
          }
        }
      );
      
    } catch (err) {
      console.error("❌ Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 min-h-screen py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="mb-4" />
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  // Determine current page content
  const isOnProgramStudyPage = currentSectionIndex === sectionsWithQuestions.length;
  const currentSection = isOnProgramStudyPage ? null : sectionsWithQuestions[currentSectionIndex];
  const currentQuestions = isOnProgramStudyPage ? programStudyQuestions : (currentSection?.questions || []);
  const sectionTitle = isOnProgramStudyPage ? "Pertanyaan Khusus Program Studi" : currentSection?.title;

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 py-8 px-4">
      {/* Header Survey */}
      <Card className="border-t-8 border-t-primary shadow-sm mb-6">
        <CardContent className="pt-6 pb-4 space-y-2">
          <h1 className="text-3xl font-normal text-gray-900">
            {sectionTitle || "Survey"}
          </h1>
          {(isOnProgramStudyPage ? null : currentSection?.description) && (
            <p className="text-sm text-gray-600">
              {currentSection?.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Questions in Current Section or Program Study Questions */}
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
          disabled={currentSectionIndex === 0 || isSubmitting}
        >
          Back
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
              Submitting...
            </>
          ) : (
            <>
              {currentSectionIndex < sectionsWithQuestions.length - 1 ? "Next" : 
               (programStudyQuestions.length > 0 && !isOnProgramStudyPage) ? "Next" : "Submit"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
