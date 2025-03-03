import { recordings, analyses, type Recording, type Analysis, type InsertRecording, type InsertAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createRecording(recording: InsertRecording): Promise<Recording>;
  getRecording(id: number): Promise<Recording | undefined>;
  getAllRecordings(): Promise<Recording[]>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAnalysisByRecordingId(recordingId: number): Promise<Analysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createRecording(recording: InsertRecording): Promise<Recording> {
    const [newRecording] = await db
      .insert(recordings)
      .values(recording)
      .returning();
    return newRecording;
  }

  async getRecording(id: number): Promise<Recording | undefined> {
    const [recording] = await db
      .select()
      .from(recordings)
      .where(eq(recordings.id, id));
    return recording;
  }

  async getAllRecordings(): Promise<Recording[]> {
    return await db.select().from(recordings);
  }

  async createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    const [newAnalysis] = await db
      .insert(analyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, id));
    return analysis;
  }

  async getAnalysisByRecordingId(recordingId: number): Promise<Analysis | undefined> {
    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.recordingId, recordingId));
    return analysis;
  }
}

export const storage = new DatabaseStorage();