import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecordingSchema, insertAnalysisSchema } from "@shared/schema";
import { spawn } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

async function analyzeAudio(audioUrl: string): Promise<any> {
  try {
    console.log('Starting audio analysis for:', audioUrl);

    // If it's a base64 string, save it as a temporary file
    let audioPath = audioUrl;
    if (audioUrl.startsWith('data:')) {
      const base64Data = audioUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      audioPath = path.join(process.cwd(), 'temp_audio.webm');
      await fs.promises.writeFile(audioPath, buffer);
    }

    const python = spawn('python3', ['server/audio_analyzer.py', audioPath]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('Python analysis error:', data.toString());
    });

    const result = await new Promise((resolve, reject) => {
      python.on('close', (code) => {
        console.log('Python process exited with code:', code);

        // Clean up temporary file if it was created
        if (audioUrl.startsWith('data:')) {
          try {
            fs.unlinkSync(audioPath);
          } catch (err) {
            console.error('Error cleaning up temp file:', err);
          }
        }

        try {
          const parsedOutput = JSON.parse(stdout);
          resolve(parsedOutput);
        } catch (e) {
          console.error('Failed to parse analysis result:', e);
          console.error('Raw stdout:', stdout);
          console.error('Raw stderr:', stderr);
          reject(new Error('Invalid analysis output'));
        }
      });
    });

    return result;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/recordings", async (req, res) => {
    try {
      console.log('Creating new recording');
      const result = insertRecordingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid recording data" });
      }

      const recording = await storage.createRecording(result.data);
      console.log('Recording created:', recording.id);
      res.json(recording);
    } catch (error) {
      console.error('Recording creation error:', error);
      res.status(500).json({ error: "Failed to create recording" });
    }
  });

  app.post("/api/analyses", async (req, res) => {
    try {
      console.log('Creating new analysis');
      const result = insertAnalysisSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid analysis data" });
      }

      const recording = await storage.getRecording(result.data.recordingId);
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }

      console.log('Starting analysis for recording:', recording.id);
      const analysisResult = await analyzeAudio(recording.audioUrl);
      console.log('Analysis result:', analysisResult);

      const analysisData = {
        ...result.data,
        ...analysisResult
      };

      const analysis = await storage.createAnalysis(analysisData);
      res.json(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: "Failed to analyze recording",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}