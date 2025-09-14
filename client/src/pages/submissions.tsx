import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, X, Clock, AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Submissions() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['/api/submissions'],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats/user'],
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-3 h-3 text-accent" />;
      case 'wrong_answer':
        return <X className="w-3 h-3 text-red-500" />;
      case 'time_limit_exceeded':
        return <Clock className="w-3 h-3 text-amber-500" />;
      case 'runtime_error':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return <div className="w-3 h-3 bg-muted rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      accepted: 'bg-accent text-accent-foreground',
      wrong_answer: 'bg-red-100 text-red-800',
      time_limit_exceeded: 'bg-amber-100 text-amber-800',
      runtime_error: 'bg-red-100 text-red-800',
      compilation_error: 'bg-red-100 text-red-800',
      pending: 'bg-muted text-muted-foreground'
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const filteredSubmissions = (submissions as any)?.filter((submission: any) => {
    const statusMatch = statusFilter === "all" || submission.status === statusFilter;
    const languageMatch = languageFilter === "all" || submission.language === languageFilter;
    return statusMatch && languageMatch;
  }) || [];

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
                  <h1 className="text-3xl font-bold text-foreground mb-2">Submission History</h1>
                  <p className="text-muted-foreground">Track your progress and review past submissions</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-status">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="wrong_answer">Wrong Answer</SelectItem>
                      <SelectItem value="time_limit_exceeded">Time Limit Exceeded</SelectItem>
                      <SelectItem value="runtime_error">Runtime Error</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-language">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submissions Table */}
              <Card className="mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Problem</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Language</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Runtime</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Memory</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                            Loading submissions...
                          </td>
                        </tr>
                      ) : filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                            No submissions found. Start solving problems!
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map((submission: any) => (
                          <tr 
                            key={submission.id} 
                            className="hover:bg-muted transition-colors"
                            data-testid={`row-submission-${submission.id}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                                {getStatusIcon(submission.status)}
                                <span className="ml-1 capitalize">
                                  {submission.status.replace('_', ' ')}
                                </span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-foreground">
                                Submission #{submission.id.slice(0, 8)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Question ID: {submission.questionId.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-foreground capitalize">
                                {submission.language || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-foreground">
                                {submission.runtime ? `${submission.runtime}ms` : 'N/A'}
                              </div>
                              {submission.runtime && (
                                <div className="text-xs text-muted-foreground">
                                  Beats ~75%
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-foreground">
                                {submission.memory ? `${submission.memory}MB` : 'N/A'}
                              </div>
                              {submission.memory && (
                                <div className="text-xs text-muted-foreground">
                                  Beats ~68%
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Submission Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Submissions</span>
                        <span className="font-medium text-foreground" data-testid="text-total-submissions">
                          {(stats as any)?.totalSubmissions || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accepted</span>
                        <span className="font-medium text-accent" data-testid="text-accepted-submissions">
                          {(stats as any)?.acceptedSubmissions || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium text-foreground" data-testid="text-success-rate">
                          {(stats as any)?.successRate ? `${Math.round((stats as any).successRate)}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Language Usage</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">JavaScript</span>
                        <span className="font-medium text-foreground">
                          {Math.round((filteredSubmissions.filter((s: any) => s.language === 'javascript').length / Math.max(filteredSubmissions.length, 1)) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Python</span>
                        <span className="font-medium text-foreground">
                          {Math.round((filteredSubmissions.filter((s: any) => s.language === 'python').length / Math.max(filteredSubmissions.length, 1)) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Other</span>
                        <span className="font-medium text-foreground">
                          {Math.round((filteredSubmissions.filter((s: any) => !['javascript', 'python'].includes(s.language)).length / Math.max(filteredSubmissions.length, 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Runtime</span>
                        <span className="font-medium text-foreground" data-testid="text-avg-runtime">
                          {(stats as any)?.averageRuntime ? `${Math.round((stats as any).averageRuntime)}ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Submission</span>
                        <span className="font-medium text-foreground">
                          {filteredSubmissions.filter((s: any) => s.status === 'accepted').length > 0 ? 'Available' : 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recent Activity</span>
                        <span className="font-medium text-foreground">
                          {filteredSubmissions.length > 0 ? 'Active' : 'None'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
