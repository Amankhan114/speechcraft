import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Analysis } from "@shared/schema";

interface Props {
  analysis: Analysis;
}

export default function AnalysisVisuals({ analysis }: Props) {
  // Ensure we have valid numeric values
  const clarityScore = typeof analysis?.clarity === 'number' ? analysis.clarity : 0;
  const pacingScore = typeof analysis?.pacing === 'number' ? analysis.pacing : 0;
  const emotionalTone = analysis?.emotionalTone || 'analyzing';

  // Mock data for the timeline with valid numbers
  const timelineData = Array.from({ length: 10 }, (_, i) => ({
    time: i * ((analysis?.durationSeconds || 30) / 10),
    clarity: Math.max(0, Math.min(100, clarityScore + (Math.random() * 20 - 10))),
    pacing: Math.max(0, Math.min(100, pacingScore + (Math.random() * 20 - 10))),
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{clarityScore}%</div>
          <div className="text-sm text-muted-foreground">Clarity Score</div>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{pacingScore}%</div>
          <div className="text-sm text-muted-foreground">Pacing Score</div>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold capitalize">{emotionalTone}</div>
          <div className="text-sm text-muted-foreground">Emotional Tone</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData}>
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (seconds)', position: 'bottom' }} 
            />
            <YAxis 
              label={{ value: 'Score', angle: -90, position: 'left' }} 
              domain={[0, 100]}
            />
            <Tooltip formatter={(value) => `${Math.round(Number(value))}%`} />
            <Line 
              type="monotone" 
              dataKey="clarity" 
              stroke="hsl(var(--primary))" 
              name="Clarity"
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey="pacing" 
              stroke="hsl(var(--secondary))" 
              name="Pacing"
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}