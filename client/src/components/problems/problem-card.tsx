import { Card, CardContent } from "@/components/ui/card";
import { DifficultyBadge } from "./difficulty-badge";
import { Link } from "wouter";

interface ProblemCardProps {
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    acceptance: number;
    topics: string[];
  };
  solved?: boolean;
}

export function ProblemCard({ problem, solved = false }: ProblemCardProps) {
  return (
    <Link href={`/problems/${problem.id}`}>
      <Card className="hover:bg-muted transition-colors cursor-pointer" data-testid={`card-problem-${problem.id}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${solved ? 'bg-accent' : 'bg-muted'}`}></div>
              <h3 className="text-lg font-semibold text-foreground">{problem.title}</h3>
            </div>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {problem.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {problem.topics?.slice(0, 3).map((topic) => (
                <span key={topic} className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs">
                  {topic}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Acceptance: {problem.acceptance}%
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
