import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an expert code reviewer for the Israeli tech job market in 2026.
Analyze these GitHub repositories and give each a score from 0 to 30.

Context about the Israeli job market:
- Companies expect TypeScript, not just JavaScript
- Testing (Jest/Vitest) is required in most job postings
- CI/CD with GitHub Actions is expected
- Clean commit messages show professionalism
- README with setup instructions is mandatory

Repositories data:
${JSON.stringify(repos, null, 2)}

For each repo, give 3 SPECIFIC recommendations:
- NOT: "Add tests" 
- YES: "Add Jest with React Testing Library — test your main components and API calls. This appears in 90% of Israeli job postings"
- NOT: "Improve commits"
- YES: "Use conventional commits format: feat: add login, fix: resolve auth bug — this shows professionalism to Israeli recruiters"

Return ONLY a JSON array:
[
  {
    "score": <number 0-30>,
    "recommendations": ["specific rec 1", "specific rec 2", "specific rec 3"]
  }
]`,
      },
    ],
  });
  const text =
    message.content[0].type === 'text' ? message.content[0].text : '';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
