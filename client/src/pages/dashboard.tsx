import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Clock, Star } from "lucide-react";
import { Link } from "wouter";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/stats/user'],
    enabled: !!user,
  });

  const { data: submissions } = useQuery({
    queryKey: ['/api/submissions'],
    enabled: !!user,
  });

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's your coding progress overview.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-accent-foreground" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-problems-solved">
                          {(stats as any)?.acceptedSubmissions || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-success-rate">
                          {(stats as any)?.successRate ? `${Math.round((stats as any).successRate)}%` : '0%'}
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
                          <Clock className="w-5 h-5 text-secondary-foreground" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Avg Runtime</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-avg-runtime">
                          {(stats as any)?.averageRuntime ? `${Math.round((stats as any).averageRuntime)}ms` : 'N/A'}
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
                          <Star className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-streak">
                          {(stats as any)?.currentStreak || 0} days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Recent Submissions</h3>
                    <div className="space-y-4">
                      {submissions && (submissions as any).length > 0 ? (
                        (submissions as any).slice(0, 5).map((submission: any) => (
                          <div key={submission.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                submission.status === 'accepted' ? 'bg-accent' : 'bg-red-500'
                              }`}></div>
                              <div>
                                <p className="text-sm font-medium text-foreground">Submission #{submission.id.slice(0, 8)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {submission.status === 'accepted' ? 'Accepted' : 'Failed'} • {new Date(submission.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              submission.status === 'accepted' 
                                ? 'status-solved' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {submission.status === 'accepted' ? 'Solved' : 'Failed'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No submissions yet. Start solving problems!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                    <div className="space-y-4">
                      <Link 
                        href="/problems"
                        className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        data-testid="link-browse-problems"
                      >
                        <h4 className="text-sm font-medium text-foreground mb-2">Browse Problems</h4>
                        <p className="text-xs text-muted-foreground">Explore coding challenges and improve your skills</p>
                      </Link>
                      
                      <Link 
                        href="/mcq"
                        className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        data-testid="link-take-quiz"
                      >
                        <h4 className="text-sm font-medium text-foreground mb-2">Take a Quiz</h4>
                        <p className="text-xs text-muted-foreground">Test your knowledge with multiple choice questions</p>
                      </Link>
                      
                      <Link 
                        href="/submissions"
                        className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        data-testid="link-view-submissions"
                      >
                        <h4 className="text-sm font-medium text-foreground mb-2">View Submissions</h4>
                        <p className="text-xs text-muted-foreground">Review your past attempts and progress</p>
                      </Link>
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
