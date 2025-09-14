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
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, FileText, BarChart3, TrendingUp } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("questions");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleCreateQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const questionData: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      difficulty: formData.get('difficulty') as string,
      starterCode: formData.get('starterCode') as string || undefined,
      topics: formData.get('topics') ? (formData.get('topics') as string).split(',').map(t => t.trim()) : [],
    };

    // Handle MCQ specific fields
    if (questionData.type === 'mcq') {
      const options = [
        formData.get('option1') as string,
        formData.get('option2') as string,
        formData.get('option3') as string,
        formData.get('option4') as string,
      ].filter(Boolean);
      
      questionData.options = options;
      questionData.correctAnswer = formData.get('correctAnswer') as string;
    }

    // Handle test cases for coding problems
    if (questionData.type === 'coding') {
      const testCases = [];
      let i = 1;
      while (formData.get(`testInput${i}`)) {
        testCases.push({
          input: formData.get(`testInput${i}`) as string,
          expectedOutput: formData.get(`testOutput${i}`) as string,
        });
        i++;
      }
      questionData.testCases = testCases;
    }

    createQuestionMutation.mutate(questionData);
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
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-question">Add New Question</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Question</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateQuestion} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" name="title" required data-testid="input-title" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Select name="type" required>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="coding">Coding Problem</SelectItem>
                              <SelectItem value="mcq">MCQ/Quiz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty</Label>
                          <Select name="difficulty" required>
                            <SelectTrigger data-testid="select-difficulty">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="topics">Topics (comma-separated)</Label>
                          <Input id="topics" name="topics" placeholder="Array, Hash Table, etc." data-testid="input-topics" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" required rows={4} data-testid="textarea-description" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="starterCode">Starter Code (for coding problems)</Label>
                        <Textarea id="starterCode" name="starterCode" rows={4} className="font-mono" data-testid="textarea-starter-code" />
                      </div>

                      {/* MCQ Options */}
                      <div className="space-y-4">
                        <Label>MCQ Options (if applicable)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="option1" placeholder="Option A" data-testid="input-option-1" />
                          <Input name="option2" placeholder="Option B" data-testid="input-option-2" />
                          <Input name="option3" placeholder="Option C" data-testid="input-option-3" />
                          <Input name="option4" placeholder="Option D" data-testid="input-option-4" />
                        </div>
                        <Input name="correctAnswer" placeholder="Correct answer (exact text)" data-testid="input-correct-answer" />
                      </div>

                      {/* Test Cases */}
                      <div className="space-y-4">
                        <Label>Test Cases (for coding problems)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="testInput1" placeholder="Test Input 1" data-testid="input-test-input-1" />
                          <Input name="testOutput1" placeholder="Expected Output 1" data-testid="input-test-output-1" />
                          <Input name="testInput2" placeholder="Test Input 2" data-testid="input-test-input-2" />
                          <Input name="testOutput2" placeholder="Expected Output 2" data-testid="input-test-output-2" />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createQuestionMutation.isPending} data-testid="button-create">
                          {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
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
                                    <div className="text-sm font-medium text-foreground">{question.title}</div>
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
                                        className="text-primary hover:text-primary/80"
                                        data-testid={`button-edit-${question.id}`}
                                      >
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-destructive hover:text-destructive/80"
                                        onClick={() => deleteQuestionMutation.mutate(question.id)}
                                        disabled={deleteQuestionMutation.isPending}
                                        data-testid={`button-delete-${question.id}`}
                                      >
                                        Delete
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
