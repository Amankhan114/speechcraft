import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, Upload } from "lucide-react";
import RecordingInterface from "@/components/RecordingInterface";
import { useState } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Public Speaking Coach</h1>
          <p className="text-lg text-muted-foreground">
            Improve your public speaking skills with instant AI-powered feedback
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2"
              alt="Person speaking"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
            <CardHeader className="relative">
              <CardTitle>Record Speech</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <Button
                size="lg"
                className="w-full"
                onClick={() => setIsRecording(true)}
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1485579149621-3123dd979885"
              alt="Microphone"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
            <CardHeader className="relative">
              <CardTitle>Upload Recording</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => 
                  toast({
                    title: "Coming Soon",
                    description: "File upload feature will be available soon!"
                  })
                }
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Audio
              </Button>
            </CardContent>
          </Card>
        </div>

        {isRecording && (
          <RecordingInterface onClose={() => setIsRecording(false)} />
        )}
      </div>
    </div>
  );
}
