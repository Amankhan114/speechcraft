import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnalysisVisuals from "@/components/AnalysisVisuals";
import FeedbackDisplay from "@/components/FeedbackDisplay";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analysis() {
  const { id } = useParams();
  
  const { data: recording, isLoading: loadingRecording } = useQuery({
    queryKey: ['/api/recordings', id],
  });

  const { data: analysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['/api/recordings', id, 'analysis'],
  });

  if (loadingRecording || loadingAnalysis) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!recording || !analysis) {
    return <div>Analysis not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Speech Analysis</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Recording: {recording.title}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalysisVisuals analysis={analysis} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackDisplay analysis={analysis} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
