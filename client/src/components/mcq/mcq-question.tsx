import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MCQQuestionProps {
  question: {
    id: string;
    title: string;
    options: string[];
    correctAnswer: string;
  };
  onAnswer: (answer: string) => void;
  selectedAnswer?: string;
}

export function MCQQuestion({ question, onAnswer, selectedAnswer }: MCQQuestionProps) {
  const [answer, setAnswer] = useState(selectedAnswer || "");

  const handleSubmit = () => {
    if (answer) {
      onAnswer(answer);
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="text-question-title">
          {question.title}
        </h2>

        <RadioGroup value={answer} onValueChange={setAnswer} className="space-y-4">
          {question.options?.map((option, index) => {
            const optionKey = String.fromCharCode(65 + index); // A, B, C, D
            return (
              <div 
                key={optionKey} 
                className="flex items-center p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                data-testid={`option-${optionKey.toLowerCase()}`}
              >
                <RadioGroupItem value={option} id={`option-${optionKey}`} className="w-4 h-4" />
                <Label htmlFor={`option-${optionKey}`} className="ml-4 cursor-pointer flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-muted-foreground mr-3">{optionKey})</span>
                    <span className="text-foreground">{option}</span>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleSubmit} 
            disabled={!answer}
            data-testid="button-submit-answer"
          >
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
