import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function check() {
  try {
    const response = await ai.models.list();
    console.log(response);
  } catch (err) {
    console.error(err);
  }
}
check();
