import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  recordingId: integer("recording_id").references(() => recordings.id),
  clarity: integer("clarity").notNull(),
  pacing: integer("pacing").notNull(),
  emotionalTone: text("emotional_tone").notNull(),
  feedback: json("feedback").notNull().$type<string[]>(),
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

export const insertRecordingSchema = createInsertSchema(recordings).omit({ 
  id: true,
  recordedAt: true 
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({ 
  id: true, 
  analyzedAt: true 
});

export type Recording = typeof recordings.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
