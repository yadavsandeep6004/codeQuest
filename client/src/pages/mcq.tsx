import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useParams } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MCQQuestion } from "@/components/mcq/mcq-question";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function MCQ() {
  const { user } = useAuth();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(id || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);

  const { data: questions } = useQuery({
    queryKey: ['/api/questions', { type: 'mcq' }],
    enabled: !!user,
  });

  const { data: currentQuestion } = useQuery({
    queryKey: ['/api/questions', selectedQuizId],
    enabled: !!user && !!selectedQuizId,
  });

  const submitMutation = useMutation({
    mutationFn: async (submissionData: any) =>
      apiRequest('POST', '/api/submissions', submissionData),
    onSuccess: () => {
      toast({ title: "Quiz submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/submissions'] });
      setQuizStarted(false);
      setSelectedQuizId(null);
      setAnswers({});
      setCurrentQuestionIndex(0);
    },
    onError: () => {
      toast({ title: "Submission failed", variant: "destructive" });
    },
  });

  const mcqQuestions = (questions as any)?.filter((q: any) => q.type === 'mcq') || [];

  const handleQuizSelect = (questionId: string) => {
    setSelectedQuizId(questionId);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswer = (answer: string) => {
    if (currentQuestion) {
      setAnswers(prev => ({ ...prev, [(currentQuestion as any).id]: answer }));
      
      // Auto-submit for single MCQ questions
      const isCorrect = answer === (currentQuestion as any).correctAnswer;
      const submissionData = {
        questionId: (currentQuestion as any).id,
        answer,
        status: isCorrect ? 'accepted' : 'wrong_answer',
        score: isCorrect ? 100 : 0,
        testCasesPassed: isCorrect ? 1 : 0,
        totalTestCases: 1,
      };

      submitMutation.mutate(submissionData);
    }
  };

  // Quiz selection view
  if (!selectedQuizId || !quizStarted) {
    return (
      <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">MCQ & Quizzes</h1>
                  <p className="text-muted-foreground">Test your knowledge with multiple choice questions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mcqQuestions.map((question: any) => (
                    <Card 
                      key={question.id} 
                      className="hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => handleQuizSelect(question.id)}
                      data-testid={`card-mcq-${question.id}`}
                    >
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {question.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {question.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {question.options?.length || 0} options
                          </span>
                          <Button size="sm" data-testid={`button-start-${question.id}`}>
                            Start Quiz
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {mcqQuestions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No MCQ questions available at the moment.
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      </ProtectedRoute>
    );
  }

  // Quiz taking view
  if (!currentQuestion) {
    return (
      <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-foreground">{(currentQuestion as any).title}</h1>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setQuizStarted(false);
                      setSelectedQuizId(null);
                    }}
                    data-testid="button-back-to-list"
                  >
                    Back to List
                  </Button>
                </div>
              </div>

              <MCQQuestion
                question={currentQuestion as any}
                onAnswer={handleAnswer}
                selectedAnswer={answers[(currentQuestion as any).id]}
              />

              {submitMutation.isPending && (
                <div className="text-center mt-6">
                  <p className="text-muted-foreground">Submitting your answer...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
