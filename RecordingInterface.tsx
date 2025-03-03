import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface Props {
  onClose: () => void;
}

export default function RecordingInterface({ onClose }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const MAX_DURATION = 300; // 5 minutes

  const createRecordingMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      // Convert blob to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      // Create recording first
      const recordingRes = await apiRequest("POST", "/api/recordings", {
        title: "Speech Recording",
        audioUrl: audioBase64,
        durationSeconds: duration
      });
      const recording = await recordingRes.json();

      // Create analysis
      const analysisRes = await apiRequest("POST", "/api/analyses", {
        recordingId: recording.id
      });
      const analysis = await analysisRes.json();

      return { recording, analysis };
    },
    onSuccess: (data) => {
      setLocation(`/analysis/${data.recording.id}`);
    },
    onError: (error) => {
      console.error('Recording error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze recording. Please try again.",
        variant: "destructive"
      });
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(chunks.current, { type: "audio/webm" });
        createRecordingMutation.mutate(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      const interval = setInterval(() => {
        setDuration(d => {
          if (d >= MAX_DURATION) {
            clearInterval(interval);
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <Card className="p-6">
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {isRecording ? "Recording in progress..." : "Ready to record"}
          </h3>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <Progress value={(duration / MAX_DURATION) * 100} />

        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <Button onClick={startRecording} size="lg">
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" size="lg">
              <Square className="mr-2 h-5 w-5" />
              Stop Recording
            </Button>
          )}
        </div>

        {createRecordingMutation.isPending && (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Analyzing your speech...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}