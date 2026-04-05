import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeWithAI(
  repos: {
    name: string;
    languages: Record<string, number>;
    hasTests: boolean;
    hasCI: boolean;
    commitCount: number;
    hasReadme: boolean;
  }[]
): Promise<{ score: number; recommendations: string[] }[]> {
  const prompt = `
    You are an expert code reviewer for the Israeli tech job market.
    Analyze these GitHub repositories and give each a score from 0 to 30.
    
    Repositories:
    ${JSON.stringify(repos, null, 2)}
    
    Return ONLY a JSON array — one object per repo in the same order:
    [
      {
        "score": <number between 0-30>,
        "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
      }
    ]
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const text = response.text ?? '';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
