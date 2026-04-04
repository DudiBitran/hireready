export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  description: string | null;
  topics: string[];
  default_branch: string;
}

export interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  passed: boolean;
  details: string;
}

export interface AnalysisResult {
  totalScore: number;
  categories: ScoreCategory[];
  recommendations: string[];
  analyzedAt: Date;
}
