interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span 
      className={`px-2 py-1 rounded-md text-xs font-medium border difficulty-${difficulty}`}
      data-testid={`badge-${difficulty}`}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}
