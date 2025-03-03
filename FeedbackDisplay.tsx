import type { Analysis } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, InfoIcon } from "lucide-react";

interface Props {
  analysis: Analysis;
}

export default function FeedbackDisplay({ analysis }: Props) {
  // Ensure feedback exists and is an array
  const feedbackItems = Array.isArray(analysis?.feedback) ? analysis.feedback : [];

  const getFeedbackType = (index: number) => {
    if (index === 0) return "success";
    if (index === 1) return "warning";
    return "info";
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {feedbackItems.length > 0 ? (
        feedbackItems.map((feedback, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-4">
              {getFeedbackIcon(getFeedbackType(index))}
              <p className="text-sm">{feedback}</p>
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-4">
          <div className="flex items-start gap-4">
            <InfoIcon className="h-5 w-5 text-blue-500" />
            <p className="text-sm">No feedback available at the moment</p>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Recommendations</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Practice maintaining a consistent pace throughout your speech</li>
          <li>Focus on clear articulation of key points</li>
          <li>Use strategic pauses for emphasis</li>
        </ul>
      </div>
    </div>
  );
}