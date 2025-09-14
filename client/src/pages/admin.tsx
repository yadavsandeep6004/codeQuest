import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, FileText, BarChart3, TrendingUp, Code, HelpCircle, Plus, Minus, Edit, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("questions");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [questionType, setQuestionType] = useState<'mcq' | 'coding'>('mcq');
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '' }]);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: adminStats } = useQuery({
    queryKey: ['/api/stats/admin'],
    enabled: !!user && user.role === 'admin',
  });

  const { data: questions } = useQuery({
    queryKey: ['/api/questions'],
    enabled: !!user && user.role === 'admin',
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) =>
      apiRequest('POST', '/api/questions', questionData),
    onSuccess: () => {
      toast({ title: "Question created successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create question", variant: "destructive" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) =>
      apiRequest('DELETE', `/api/questions/${questionId}`),
    onSuccess: () => {
      toast({ title: "Question deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
    },
    onError: () => {
      toast({ title: "Failed to delete question", variant: "destructive" });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, questionData }: { id: string; questionData: any }) =>
      apiRequest('PUT', `/api/questions/${id}`, questionData),
    onSuccess: () => {
      toast({ title: "Question updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      setIsCreateModalOpen(false);
      setIsEditMode(false);
      setEditingQuestion(null);
    },
    onError: () => {
      toast({ title: "Failed to update question", variant: "destructive" });
    },
  });

  const handleCreateQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const questionData: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: questionType,
      difficulty: formData.get('difficulty') as string,
      topics: formData.get('topics') ? (formData.get('topics') as string).split(',').map(t => t.trim()) : [],
    };

    // Handle MCQ specific fields
    if (questionType === 'mcq') {
      const options = [
        formData.get('option1') as string,
        formData.get('option2') as string,
        formData.get('option3') as string,
        formData.get('option4') as string,
      ].filter(Boolean);
      
      questionData.options = options;
      questionData.correctAnswer = formData.get('correctAnswer') as string;
    }

    // Handle coding specific fields
    if (questionType === 'coding') {
      questionData.starterCode = formData.get('starterCode') as string || undefined;
      questionData.testCases = testCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim());
    }

    if (isEditMode && editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, questionData });
    } else {
      createQuestionMutation.mutate(questionData);
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '' }]);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const updateTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const updated = testCases.map((tc, i) =>
      i === index ? { ...tc, [field]: value } : tc
    );
    setTestCases(updated);
  };

  const resetForm = () => {
    setQuestionType('mcq');
    setTestCases([{ input: '', expectedOutput: '' }]);
    setEditingQuestion(null);
    setIsEditMode(false);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setIsEditMode(true);
    setQuestionType(question.type);
    
    // Set test cases for coding questions
    if (question.type === 'coding' && question.testCases) {
      setTestCases(question.testCases.length > 0 ? question.testCases : [{ input: '', expectedOutput: '' }]);
    } else {
      setTestCases([{ input: '', expectedOutput: '' }]);
    }
    
    setIsCreateModalOpen(true);
  };

  return (
    <ProtectedRoute requireAdmin={true}>
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
                  <p className="text-muted-foreground">Manage questions, view student progress, and oversee platform content</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                  setIsCreateModalOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-question">Add New Question</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">
                        {isEditMode ? 'Edit Question' : 'Create New Question'}
                      </DialogTitle>
                      <p className="text-muted-foreground">
                        {isEditMode ? 'Update the question details below' : 'Choose the type of question you want to create'}
                      </p>
                    </DialogHeader>

                    {/* Question Type Toggle - Disabled in edit mode */}
                    <div className="flex items-center justify-center space-x-4 p-4 bg-muted/30 rounded-lg">
                      <Button
                        type="button"
                        variant={questionType === 'mcq' ? 'default' : 'outline'}
                        onClick={() => !isEditMode && setQuestionType('mcq')}
                        disabled={isEditMode}
                        className="flex items-center space-x-2 px-6 py-3"
                        data-testid="button-mcq-type"
                      >
                        <HelpCircle className="w-5 h-5" />
                        <span>Multiple Choice Question</span>
                      </Button>
                      <Button
                        type="button"
                        variant={questionType === 'coding' ? 'default' : 'outline'}
                        onClick={() => !isEditMode && setQuestionType('coding')}
                        disabled={isEditMode}
                        className="flex items-center space-x-2 px-6 py-3"
                        data-testid="button-coding-type"
                      >
                        <Code className="w-5 h-5" />
                        <span>Coding Problem</span>
                      </Button>
                    </div>
                    {isEditMode && (
                      <p className="text-sm text-muted-foreground text-center -mt-2">
                        Question type cannot be changed when editing
                      </p>
                    )}

                    <form onSubmit={handleCreateQuestion} className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Basic Information</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-base font-medium">Question Title *</Label>
                          <Input
                            id="title"
                            name="title"
                            required
                            placeholder="Enter a clear, descriptive title"
                            className="text-base"
                            defaultValue={editingQuestion?.title || ''}
                            data-testid="input-title"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="difficulty" className="text-base font-medium">Difficulty Level *</Label>
                            <Select name="difficulty" required defaultValue={editingQuestion?.difficulty || ''}>
                              <SelectTrigger data-testid="select-difficulty" className="text-base">
                                <SelectValue placeholder="Choose difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">🟢 Easy</SelectItem>
                                <SelectItem value="medium">🟡 Medium</SelectItem>
                                <SelectItem value="hard">🔴 Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="topics" className="text-base font-medium">Topics (Optional)</Label>
                            <Input
                              id="topics"
                              name="topics"
                              placeholder="e.g., Arrays, Loops, Logic"
                              className="text-base"
                              defaultValue={editingQuestion?.topics ? editingQuestion.topics.join(', ') : ''}
                              data-testid="input-topics"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-base font-medium">Question Description *</Label>
                          <Textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            placeholder="Write a clear description of the problem or question..."
                            className="text-base"
                            defaultValue={editingQuestion?.description || ''}
                            data-testid="textarea-description"
                          />
                        </div>
                      </div>

                      {/* MCQ Specific Fields */}
                      {questionType === 'mcq' && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="default">Multiple Choice Options</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-2">
                              <Label className="text-base font-medium">Option A *</Label>
                              <Input
                                name="option1"
                                required
                                placeholder="Enter first option"
                                className="text-base"
                                defaultValue={editingQuestion?.options?.[0] || ''}
                                data-testid="input-option-1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-base font-medium">Option B *</Label>
                              <Input
                                name="option2"
                                required
                                placeholder="Enter second option"
                                className="text-base"
                                defaultValue={editingQuestion?.options?.[1] || ''}
                                data-testid="input-option-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-base font-medium">Option C</Label>
                              <Input
                                name="option3"
                                placeholder="Enter third option (optional)"
                                className="text-base"
                                defaultValue={editingQuestion?.options?.[2] || ''}
                                data-testid="input-option-3"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-base font-medium">Option D</Label>
                              <Input
                                name="option4"
                                placeholder="Enter fourth option (optional)"
                                className="text-base"
                                defaultValue={editingQuestion?.options?.[3] || ''}
                                data-testid="input-option-4"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="correctAnswer" className="text-base font-medium">Correct Answer *</Label>
                            <Input
                              name="correctAnswer"
                              required
                              placeholder="Enter the exact text of the correct option"
                              className="text-base"
                              defaultValue={editingQuestion?.correctAnswer || ''}
                              data-testid="input-correct-answer"
                            />
                            <p className="text-sm text-muted-foreground">
                              💡 Tip: Copy and paste the exact text from one of the options above
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Coding Specific Fields */}
                      {questionType === 'coding' && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="default">Coding Problem Setup</Badge>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="starterCode" className="text-base font-medium">Starter Code (Optional)</Label>
                            <Textarea
                              id="starterCode"
                              name="starterCode"
                              rows={6}
                              className="font-mono text-sm"
                              placeholder="function solution() {&#10;    // Write your code here&#10;    return result;&#10;}"
                              defaultValue={editingQuestion?.starterCode || ''}
                              data-testid="textarea-starter-code"
                            />
                            <p className="text-sm text-muted-foreground">
                              💡 Provide a basic template to help students get started
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Test Cases *</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTestCase}
                                className="flex items-center space-x-1"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Test Case</span>
                              </Button>
                            </div>
                            
                            {testCases.map((testCase, index) => (
                              <div key={index} className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">Test Case {index + 1}</span>
                                  {testCases.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTestCase(index)}
                                      className="text-destructive hover:text-destructive/80"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-sm">Input</Label>
                                    <Textarea
                                      value={testCase.input}
                                      onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                      placeholder="Enter test input"
                                      rows={2}
                                      className="font-mono text-sm"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-sm">Expected Output</Label>
                                    <Textarea
                                      value={testCase.expectedOutput}
                                      onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                                      placeholder="Enter expected output"
                                      rows={2}
                                      className="font-mono text-sm"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            <p className="text-sm text-muted-foreground">
                              💡 Add multiple test cases to thoroughly validate student solutions
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                          className="px-6"
                          data-testid="button-create"
                        >
                          {(createQuestionMutation.isPending || updateQuestionMutation.isPending)
                            ? (isEditMode ? "Updating..." : "Creating...")
                            : (isEditMode ? "Update Question" : "Create Question")
                          }
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-active-students">
                          {(adminStats as any)?.activeStudents || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent-foreground" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-total-questions">
                          {(adminStats as any)?.totalQuestions || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-secondary-foreground" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Daily Submissions</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-daily-submissions">
                          {(adminStats as any)?.dailySubmissions || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-admin-success-rate">
                          {(adminStats as any)?.successRate ? `${Math.round((adminStats as any).successRate)}%` : '0%'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList>
                  <TabsTrigger value="questions" data-testid="tab-questions">Questions Management</TabsTrigger>
                  <TabsTrigger value="analytics" data-testid="tab-analytics">System Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="questions">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Difficulty</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submissions</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Acceptance</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-card divide-y divide-border">
                            {(questions as any)?.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                  No questions created yet. Create your first question!
                                </td>
                              </tr>
                            ) : (
                              (questions as any)?.map((question: any) => (
                                <tr key={question.id} className="hover:bg-muted transition-colors" data-testid={`row-question-${question.id}`}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="text-sm font-medium text-foreground cursor-help">
                                            {question.title.length > 20
                                              ? `${question.title.substring(0, 20)}...`
                                              : question.title
                                            }
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-md break-words whitespace-normal">{question.title}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                      question.type === 'coding' 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-secondary text-secondary-foreground'
                                    }`}>
                                      {question.type === 'coding' ? 'Coding' : 'MCQ'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <DifficultyBadge difficulty={question.difficulty} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {question.submissions || 0}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {question.acceptance || 0}%
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary hover:text-primary/80 p-2"
                                        onClick={() => handleEditQuestion(question)}
                                        data-testid={`button-edit-${question.id}`}
                                        title="Edit question"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive/80 p-2"
                                        onClick={() => deleteQuestionMutation.mutate(question.id)}
                                        disabled={deleteQuestionMutation.isPending}
                                        data-testid={`button-delete-${question.id}`}
                                        title="Delete question"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Platform Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Users</span>
                            <span className="font-medium text-foreground">{(adminStats as any)?.activeStudents || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Questions</span>
                            <span className="font-medium text-foreground">{(adminStats as any)?.totalQuestions || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Active Users</span>
                            <span className="font-medium text-foreground">{Math.floor(((adminStats as any)?.activeStudents || 0) * 0.3)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Question Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coding Problems</span>
                            <span className="font-medium text-foreground">
                              {(questions as any)?.filter((q: any) => q.type === 'coding').length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">MCQ Questions</span>
                            <span className="font-medium text-foreground">
                              {(questions as any)?.filter((q: any) => q.type === 'mcq').length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Easy Difficulty</span>
                            <span className="font-medium text-foreground">
                              {(questions as any)?.filter((q: any) => q.difficulty === 'easy').length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Medium Difficulty</span>
                            <span className="font-medium text-foreground">
                              {(questions as any)?.filter((q: any) => q.difficulty === 'medium').length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hard Difficulty</span>
                            <span className="font-medium text-foreground">
                              {(questions as any)?.filter((q: any) => q.difficulty === 'hard').length || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
