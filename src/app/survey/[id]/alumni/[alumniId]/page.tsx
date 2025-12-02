"use client";

import { ResponseAnswerCard, type ResponseAnswer } from "@/components/response_answer_card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  getCurrentUserFromAPI,
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

// Helper function to convert text formatting to HTML
function formatText(text: string): string {
  if (!text) return text;
  
  // Convert <b><i><u>text</u></i></b> patterns to HTML
  let formatted = text;
  
  // Handle combined formatting tags
  formatted = formatted.replace(/<b><i><u>(.*?)<\/u><\/i><\/b>/g, '<strong><em><u>$1</u></em></strong>');
  formatted = formatted.replace(/<b><i>(.*?)<\/i><\/b>/g, '<strong><em>$1</em></strong>');
  formatted = formatted.replace(/<b><u>(.*?)<\/u><\/b>/g, '<strong><u>$1</u></strong>');
  formatted = formatted.replace(/<i><u>(.*?)<\/u><\/i>/g, '<em><u>$1</u></em>');
  
  // Handle single formatting tags
  formatted = formatted.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
  formatted = formatted.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');
  // <u> tag is already valid HTML, no need to replace
  
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

export default function AlumniAnswerPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = Number(params.id);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [sectionsWithQuestions, setSectionsWithQuestions] = useState<SectionWithQuestions[]>([]);
  const [programStudyQuestions, setProgramStudyQuestions] = useState<ResponseAnswer[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]); // Track navigation history
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
          
          // Log raw options for each question BEFORE any transformation
          questionsData.forEach(q => {
            console.log(`🔍 RAW Q${q.id} options BEFORE transformation:`, JSON.stringify(q.options));
          });
          
          // Transform questions ke format ResponseAnswer
          const transformedQuestions: ResponseAnswer[] = questionsData.map(q => {
            let options = q.options;
            let minValue = 1;
            let maxValue = 5;
            let minLabel = "Sangat Tidak Setuju";
            let maxLabel = "Sangat Setuju";
            
            console.log(`🔍 Question ${q.id} raw options from API:`, options);
            console.log(`   Type: ${typeof options}, Is array: ${Array.isArray(options)}`);
            
            if (typeof options === 'string') {
              try {
                options = JSON.parse(options);
                console.log(`   After JSON.parse:`, options);
              } catch (e) {
                console.error(`Failed to parse options for question ${q.id}:`, e);
                options = [];
              }
            }
            
            // For linear scale questions, extract min/max data from options
            let formattedOptions: Array<{ id: string; label: string }> = [];
            if (q.question_type === 'scale' && options && typeof options === 'object' && !Array.isArray(options)) {
              // Extract linear scale data from options object
              minValue = options.minValue ?? 1;
              maxValue = options.maxValue ?? 5;
              minLabel = formatText(options.minLabel ?? "Sangat Tidak Setuju");
              maxLabel = formatText(options.maxLabel ?? "Sangat Setuju");
              console.log(`📊 Linear scale question ${q.id}: ${minValue}-${maxValue}, "${minLabel}" - "${maxLabel}"`);
            }
            // Transform options format ke {id, label}
            else if (Array.isArray(options)) {
              formattedOptions = options.map((opt, idx) => {
                if (typeof opt === 'string') {
                  return { id: String(idx + 1), label: formatText(opt) };
                }
                if (opt && typeof opt === 'object' && opt.label) {
                  // Keep the original structure including navigation if exists
                  return {
                    id: opt.id || String(idx + 1),
                    label: formatText(opt.label),
                    navigation: opt.navigation // Preserve navigation for branching
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
              branches: q.branches || [], // Store branches for navigation
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
        
        console.log("✅ Sections with questions:", sectionsWithQuestionsData);
        setSectionsWithQuestions(sectionsWithQuestionsData);
        
        // Get program study ID from user API
        const user = await getCurrentUserFromAPI();
        console.log("📋 Current user from API:", user);
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
                let minValue = 1;
                let maxValue = 5;
                let minLabel = "Sangat Tidak Setuju";
                let maxLabel = "Sangat Setuju";
                
                if (typeof options === 'string') {
                  try {
                    options = JSON.parse(options);
                  } catch (e) {
                    console.error(`Failed to parse options for program question ${q.id}:`, e);
                    options = [];
                  }
                }
                
                // For linear scale questions, extract min/max data from options
                let formattedOptions: Array<{ id: string; label: string }> = [];
                if (q.question_type === 'scale' && options && typeof options === 'object' && !Array.isArray(options)) {
                  // Extract linear scale data from options object
                  minValue = options.minValue ?? 1;
                  maxValue = options.maxValue ?? 5;
                  minLabel = formatText(options.minLabel ?? "Sangat Tidak Setuju");
                  maxLabel = formatText(options.maxLabel ?? "Sangat Setuju");
                  console.log(`📊 Program study linear scale question ${q.id}: ${minValue}-${maxValue}, "${minLabel}" - "${maxLabel}"`);
                }
                // Transform options format ke {id, label}
                else if (Array.isArray(options)) {
                  formattedOptions = options.map((opt, idx) => {
                    if (typeof opt === 'string') {
                      return { id: String(idx + 1), label: formatText(opt) };
                    }
                    if (opt && typeof opt === 'object' && opt.label) {
                      // Keep the original structure including navigation if exists
                      return {
                        id: opt.id || String(idx + 1),
                        label: formatText(opt.label),
                        navigation: opt.navigation // Preserve navigation for branching
                      };
                    }
                    return { id: String(idx + 1), label: formatText(String(opt)) };
                  });
                }
                
                return {
                  id: `ps-${q.id}`,
                  type: mapQuestionType(q.question_type),
                  title: formatText(q.text),
                  description: formatText(q.description || ""),
                  required: q.is_required,
                  options: formattedOptions,
                  minValue,
                  maxValue,
                  minLabel,
                  maxLabel
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
      
      // Check for branch navigation in radio questions
      let targetSectionIndex = -1;
      
      for (const question of currentSection.questions) {
        if (question.type === 'multiple_choice' && question.branches && question.branches.length > 0) {
          const answer = answers[question.id];
          if (answer?.selectedOption) {
            // Find the selected option label
            const selectedOption = question.options?.find(opt => opt.id === answer.selectedOption);
            if (selectedOption) {
              // Check if this answer triggers a branch
              const branch = question.branches.find(b => b.answer_value === selectedOption.label);
              if (branch) {
                // Find target section index
                const targetIndex = sectionsWithQuestions.findIndex(s => s.id === branch.next_section);
                if (targetIndex !== -1) {
                  targetSectionIndex = targetIndex;
                  console.log(`🔀 Branch navigation triggered: ${selectedOption.label} → Section ${branch.next_section}`);
                  break; // Use first matching branch
                }
              }
            }
          }
        }
      }
      
      // Navigate based on branch or sequential order
      if (targetSectionIndex !== -1) {
        // Branch navigation - add to history
        setCurrentSectionIndex(targetSectionIndex);
        setNavigationHistory(prev => [...prev, targetSectionIndex]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (currentSectionIndex < sectionsWithQuestions.length - 1) {
        // Sequential navigation - add to history
        const nextIndex = currentSectionIndex + 1;
        setCurrentSectionIndex(nextIndex);
        setNavigationHistory(prev => [...prev, nextIndex]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (programStudyQuestions.length > 0) {
        // Pindah ke program study questions page - add to history
        const programStudyIndex = sectionsWithQuestions.length;
        setCurrentSectionIndex(programStudyIndex);
        setNavigationHistory(prev => [...prev, programStudyIndex]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      // Remove current index from history
      const newHistory = [...navigationHistory];
      newHistory.pop();
      
      // Go to previous index in history
      const previousIndex = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentSectionIndex(previousIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      console.log("📤 Submitting answers:", answers);
      console.log("📤 Total answered questions:", Object.keys(answers).length);
    
      // Collect ALL questions from ALL sections (including skipped ones)
      const allQuestions: ResponseAnswer[] = [];
      
      // Add regular section questions
      sectionsWithQuestions.forEach(section => {
        section.questions.forEach(q => {
          allQuestions.push(q);
        });
      });
      
      // Add program study questions
      programStudyQuestions.forEach(q => {
        allQuestions.push(q);
      });
      
      console.log("📋 Total questions in survey:", allQuestions.length);
      console.log("📋 Answered questions:", Object.keys(answers).length);
      console.log("📋 Skipped questions:", allQuestions.length - Object.keys(answers).length);
      
      // Kirim jawaban ke backend (termasuk yang diskip dengan nilai "-")
      const formattedAnswers: CreateAnswerData[] = allQuestions.map(question => {
        // Check if this question was answered
        const answer = answers[question.id];
        
        // Determine if this is a program study question or regular question
        const isProgramStudyQuestion = question.id.toString().startsWith('ps-');
        const questionId = isProgramStudyQuestion 
          ? Number(question.id.toString().replace('ps-', ''))
          : Number(question.id);
        
        let answerValue: any;
        let isSkipped = false;
        
        if (!answer) {
          // Question was skipped - send default value based on question type
          if (question.type === 'checkbox') {
            // For checkbox, send empty JSON array
            answerValue = JSON.stringify([]);
            console.log(`📋 Question ${question.id} (ID: ${questionId}) SKIPPED (checkbox) - sending empty array: ${answerValue}`);
          } else {
            // For other types, send "-"
            answerValue = "-";
            console.log(`📋 Question ${question.id} (ID: ${questionId}) SKIPPED - sending "-"`);
          }
          isSkipped = true;
        } else {
          // Question was answered - process the answer
          console.log(`📋 Processing question: ID=${question.id}, isProgramStudy=${isProgramStudyQuestion}, numericId=${questionId}, type=${answer.type}`);
          console.log(`   Question options:`, question.options);
          console.log(`   Answer data:`, answer);
          
          if (answer.type === 'multiple_choice' || answer.type === 'dropdown') {
            const selectedOptionId = answer.selectedOption || "";
            console.log(`  → Selected option ID: "${selectedOptionId}"`);
            console.log(`  → All option IDs:`, question.options?.map(opt => `"${opt.id}"`));
            
            // Use question.options (from original data) instead of answer.options
            const option = question.options?.find(opt => {
              console.log(`     Comparing: opt.id="${opt.id}" vs selectedId="${selectedOptionId}"`);
              return opt.id === selectedOptionId;
            });
            
            console.log(`  → Found option:`, option);
            
            // Send the option LABEL for backend validation (backend expects label in options array)
            answerValue = option?.label || selectedOptionId;
            console.log(`  → Final answer value (LABEL): "${answerValue}"`);
          } else if (answer.type === 'checkbox') {
            const selectedIds = answer.selectedOptions || [];
            const selectedLabels = selectedIds.map(id => {
              // Use question.options (from original data) instead of answer.options
              const option = question.options?.find(opt => opt.id === id);
              return option?.label || id;
            });
            // Convert array to JSON string for backend (backend expects JSON array)
            answerValue = JSON.stringify(selectedLabels);
            console.log(`  → Selected checkboxes: ${selectedLabels.join(', ')} → JSON: ${answerValue}`);
          } else if (answer.type === 'short_answer' || answer.type === 'paragraph') {
            answerValue = answer.textAnswer || "";
            console.log(`  → Text answer: ${answerValue}`);
          } else if (answer.type === 'linear_scale') {
            answerValue = answer.selectedValue || 0;
            console.log(`  → Scale value: ${answerValue}`);
          } else {
            answerValue = "";
          }
        }
        
        const formattedAnswer = {
          survey: surveyId,
          question: isProgramStudyQuestion ? undefined : questionId,
          answer_value: answerValue,
          program_specific_question: isProgramStudyQuestion ? questionId : undefined
        } as CreateAnswerData;
        
        if (!isSkipped) {
          console.log(`  → Formatted:`, formattedAnswer);
        }
        
        return formattedAnswer;
      });
    
      console.log("📤 Total formatted answers:", formattedAnswers.length);
      console.log("📤 All formatted answers:", JSON.stringify(formattedAnswers, null, 2));

      const response = await submitBulkAnswers(surveyId, formattedAnswers);
      console.log("✅ Backend response:", response);
      
      // Check response format
      if (response && typeof response === 'object' && 'success' in response && 'errors' in response) {
        // New format: {success: [...], errors: [...]}
        const successAnswers = Array.isArray(response.success) ? response.success : [];
        const errorAnswers = Array.isArray(response.errors) ? response.errors : [];
        
        console.log("✅ Successfully saved:", successAnswers.length, "answers");
        console.log("❌ Failed to save:", errorAnswers.length, "answers");
        
        if (errorAnswers.length > 0) {
          console.error("❌ Error details:", errorAnswers);
          errorAnswers.forEach((err: any) => {
            console.error(`  - Full error object:`, err);
            console.error(`  - Question ${err.question || err.question_id || 'unknown'}: ${err.error || err.message || JSON.stringify(err)}`);
          });
        }
        
        if (successAnswers.length > 0) {
          const savedQuestionIds = successAnswers.map((r: any) => r.question);
          console.log("✅ Saved question IDs:", savedQuestionIds);
        }
      } else if (Array.isArray(response)) {
        // Old format: array of answers
        console.log("✅ Total answers saved:", response.length);
        const savedQuestionIds = response.map((r: any) => r.question);
        const sentQuestionIds = formattedAnswers.map(a => a.question).filter(id => id !== undefined);
        const missingSaves = sentQuestionIds.filter(id => !savedQuestionIds.includes(id));
        
        if (missingSaves.length > 0) {
          console.warn("⚠️ Some answers were not saved:", missingSaves);
        }
      }

      await toast.promise(
        Promise.resolve(response),
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
  const sectionTitle = isOnProgramStudyPage ? "Pertanyaan Khusus Program Studi" : (currentSection?.title ? formatText(currentSection.title) : "");

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 py-8 px-4">
      {/* Header Survey */}
      <Card className="border-t-8 border-t-primary shadow-sm mb-6">
        <CardContent className="pt-6 pb-4 space-y-2">
          <h1 
            className="text-3xl font-normal text-gray-900"
            dangerouslySetInnerHTML={{ __html: sectionTitle || "Survey" }}
          />
          {(isOnProgramStudyPage ? null : currentSection?.description) && (
            <p 
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: formatText(currentSection?.description || "") }}
            />
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
          disabled={navigationHistory.length <= 1 || isSubmitting}
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
