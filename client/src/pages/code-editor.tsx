import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useParams } from "wouter";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { executeCode } from "@/lib/judge0";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CodeEditor() {
  const { user } = useAuth();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [testResults, setTestResults] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: problem, isLoading } = useQuery({
    queryKey: ['/api/questions', id],
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (problem && (problem as any).starterCode) {
      setCode((problem as any).starterCode);
    }
  }, [problem]);

  const submitMutation = useMutation({
    mutationFn: async (submissionData: any) =>
      apiRequest('POST', '/api/submissions', submissionData),
    onSuccess: () => {
      toast({ title: "Solution submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/submissions'] });
    },
    onError: () => {
      toast({ title: "Submission failed", variant: "destructive" });
    },
  });

  const handleRun = async () => {
    if (!(problem as any)?.testCases) {
      toast({ title: "No test cases available", variant: "destructive" });
      return;
    }

    setIsExecuting(true);
    try {
      const results = await executeCode(code, language, (problem as any).testCases);
      setTestResults(results);
    } catch (error) {
      toast({ title: "Execution failed", variant: "destructive" });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!testResults) {
      await handleRun();
      return;
    }

    const submissionData = {
      questionId: id,
      code,
      language,
      status: testResults.status,
      runtime: testResults.runtime,
      memory: testResults.memory,
      score: testResults.status === 'accepted' ? 100 : 0,
      testCasesPassed: testResults.passedTests,
      totalTestCases: testResults.totalTests,
    };

    submitMutation.mutate(submissionData);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">Loading...</div>
      </ProtectedRoute>
    );
  }

  if (!problem) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Problem not found</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Problem Description Panel */}
        <div className="w-1/2 bg-card border-r border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-problem-title">
                {(problem as any).title}
              </h1>
              <div className="flex items-center space-x-2">
                <DifficultyBadge difficulty={(problem as any).difficulty} />
                <Button variant="ghost" size="sm">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Acceptance: {(problem as any).acceptance}%</span>
              <span>•</span>
              <span>Submissions: {(problem as any).submissions}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose max-w-none">
              <div 
                className="text-foreground"
                dangerouslySetInnerHTML={{ __html: (problem as any).description }}
                data-testid="text-problem-description"
              />
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center space-x-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRun}
                disabled={isExecuting}
                data-testid="button-run"
              >
                {isExecuting ? "Running..." : "Run"}
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                data-testid="button-submit"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <MonacoEditor
              value={code}
              onChange={setCode}
              language={language}
              height="100%"
            />
          </div>

          {/* Test Results Panel */}
          <div className="h-64 border-t border-border bg-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Test Results</h3>
              {testResults && (
                <div className="text-xs text-muted-foreground">
                  {testResults.passedTests} / {testResults.totalTests} test cases passed
                </div>
              )}
            </div>
            <div className="p-4 overflow-y-auto">
              {testResults ? (
                <div className="space-y-3">
                  {testResults.testResults?.map((result: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3" data-testid={`test-result-${index}`}>
                      <div className={`w-2 h-2 rounded-full ${
                        result.status === 'accepted' ? 'bg-accent' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-mono text-foreground">
                        Test case {result.testCase}: {result.input}
                      </span>
                      <span className={`text-xs font-medium ${
                        result.status === 'accepted' ? 'text-accent' : 'text-red-500'
                      }`}>
                        {result.status === 'accepted' ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground">
                      <p>Status: {testResults.status}</p>
                      <p>Runtime: {testResults.runtime}ms | Memory: {testResults.memory}MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Run your code to see test results
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
