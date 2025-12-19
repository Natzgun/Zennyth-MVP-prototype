import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getZenCoachAdvice = async (
  tasks: Task[],
  userName: string
): Promise<string> => {
  const client = getClient();
  
  if (!client) {
    return "Zen Coach is currently meditating (API Key missing). Please complete your highest priority task first!";
  }

  const highPriorityTasks = tasks
    .sort((a, b) => b.calculatedPriority - a.calculatedPriority)
    .slice(0, 3)
    .map(t => `- ${t.title} (Priority Score: ${t.calculatedPriority})`)
    .join('\n');

  const prompt = `
    You are Zennyth, a wise and calming productivity coach for a university student named ${userName}.
    Here are their top 3 tasks for today based on a WSJF algorithm:
    ${highPriorityTasks}

    Please provide a short, motivating paragraph (max 100 words). 
    1. Acknowledge the workload.
    2. Give one specific strategy to tackle the top task.
    3. End with a zen/calm encouragement.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Focus on the present moment. Your tasks are manageable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The path is unclear right now, but your potential is limitless. Start with the first task.";
  }
};
