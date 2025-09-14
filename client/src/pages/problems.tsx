import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProblemCard } from "@/components/problems/problem-card";
import { Search } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Problems() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [type, setType] = useState("all");

  const { data: problems, isLoading } = useQuery({
    queryKey: ['/api/questions', {
      type: type === "all" ? undefined : type,
      difficulty: difficulty === "all" ? undefined : difficulty,
      search: search || undefined
    }],
    enabled: !!user,
  });

  const { data: submissions } = useQuery({
    queryKey: ['/api/submissions'],
    enabled: !!user,
  });

  const solvedProblems = new Set(
    (submissions as any)?.filter((s: any) => s.status === 'accepted').map((s: any) => s.questionId) || []
  );

  const codingProblems = (problems as any)?.filter((p: any) => p.type === 'coding') || [];

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Problems</h1>
                  <p className="text-muted-foreground">Practice coding problems to improve your skills</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-[180px]" data-testid="select-difficulty">
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search problems..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search"
                    />
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading problems...</div>
              ) : codingProblems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No coding problems found. Try adjusting your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {codingProblems.map((problem: any) => (
                    <ProblemCard
                      key={problem.id}
                      problem={problem}
                      solved={solvedProblems.has(problem.id)}
                    />
                  ))}
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
