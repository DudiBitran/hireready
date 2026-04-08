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
    codeContent: string;
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
For each repo, also analyze the actual code:
${repos.map((r) => `=== ${r.name} ===\n${r.codeContent}`).join('\n\n---\n\n')}
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
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found');
  return JSON.parse(match[0]);
}

export async function analyzeOverall(
  repo: {
    name: string;
    languages: Record<string, number>;
    hasTests: boolean;
    hasCI: boolean;
    commitCount: number;
    hasReadme: boolean;
    score: number;
  }[]
): Promise<{
  summary: string;
  strengths: string[];
  gaps: string[];
  marketReadiness: string;
  priorityActions: { priority: number; action: string; impact: string }[];
  techToAdd: { name: string; priority: string; reason: string }[];
}> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are an expert career advisor for the Israeli tech job market in 2026.
    
Analyze this developer's GitHub profile as a whole and provide comprehensive feedback.

Repositories data:
${JSON.stringify(repo, null, 2)}

Return ONLY a JSON object in this exact format:
{
  "summary": "2-3 sentences describing the developer's overall profile",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2", "gap 3"],
  "marketReadiness": "one sentence about readiness for Israeli job market",
  "priorityActions": [
    {
      "priority": 1,
      "action": "specific action to take",
      "impact": "expected impact on job search"
    }
  ],
  "techToAdd": [
    {
      "name": "technology name",
      "priority": "must-have / nice-to-have",
      "reason": "why Israeli companies want this"
    }
  ]
}`,
      },
    ],
  });
  const text =
    message.content[0].type === 'text' ? message.content[0].text : '';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

export async function selectImportantFiles(
  files: { name: string; path: string }[],
  repoName: string
): Promise<string[]> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are a code reviewer. Given this list of files from a GitHub repo called "${repoName}", select the 3 most important files that best reveal the developer's coding quality and skills.

Files:
${JSON.stringify(files, null, 2)}

Return ONLY a JSON array of 3 file paths:
["path/to/file1", "path/to/file2", "path/to/file3"]

Prefer: main logic files, components, API routes, utilities.
Avoid: config files, .gitignore, lock files, assets.`,
      },
    ],
  });
  const text =
    message.content[0].type === 'text' ? message.content[0].text : '';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found in response');

  return JSON.parse(match[0]);
}
