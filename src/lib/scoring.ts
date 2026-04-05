import { AnalysisResult, ScoreCategory } from '@/types';

function scoreLanguage(languages: Record<string, number>): ScoreCategory {
  const mainLanguages = ['TypeScript', 'JavaScript', 'Python', 'C#', 'Java'];
  const hasTS = 'TypeScript' in languages;
  const hasMainLanguage = mainLanguages.some((lang) => lang in languages);
  const score = hasTS ? 15 : hasMainLanguage ? 8 : 0;
  const passed = hasMainLanguage;
  return {
    name: 'Language',
    score,
    maxScore: 15,
    passed,
    details: hasTS
      ? 'TypeScript found — excellent choice for the Israeli market'
      : hasMainLanguage
        ? 'Good language choice — adding TypeScript would improve your score'
        : 'No recognized language found',
  };
}

function scoreTesting(testingLibrary: boolean): ScoreCategory {
  return {
    name: 'Testing library',
    score: testingLibrary ? 20 : 0,
    maxScore: 20,
    passed: testingLibrary,
    details: testingLibrary
      ? 'Testing library found in the project'
      : 'No Testing library found — add Testing library to improve your score',
  };
}

function scoreCICD(hasCICD: boolean): ScoreCategory {
  return {
    name: 'CI/CD Process',
    score: hasCICD ? 15 : 0,
    maxScore: 15,
    passed: hasCICD,
    details: hasCICD
      ? 'CI/CD Process found in the project'
      : 'No CI/CD Process found — add CI/CD Process to improve your score',
  };
}

function scoreReadme(hasReadme: boolean): ScoreCategory {
  return {
    name: 'README',
    score: hasReadme ? 8 : 0,
    maxScore: 8,
    passed: hasReadme,
    details: hasReadme
      ? 'README found in the project'
      : 'No README found — add README to improve your score',
  };
}

function scoreActivity(hasActivity: boolean): ScoreCategory {
  return {
    name: 'Activity',
    score: hasActivity ? 3 : 0,
    maxScore: 3,
    passed: hasActivity,
    details: hasActivity
      ? 'Project updated in the last 6 months'
      : 'Project not updated in 6+ months — keep your projects active',
  };
}

function scoreDescription(hasDescription: boolean): ScoreCategory {
  return {
    name: 'Description',
    score: hasDescription ? 2 : 0,
    maxScore: 2,
    passed: hasDescription,
    details: hasDescription
      ? 'Description found in the project'
      : 'No description found — add description to improve your score',
  };
}

function scoreCommits(hasCommits: number): ScoreCategory {
  let points = 0;
  if (hasCommits >= 20) {
    points = 7;
  } else if (hasCommits >= 10) {
    points = 5;
  } else if (hasCommits >= 5) {
    points = 3;
  } else {
    points = 0;
  }
  return {
    name: 'Commits',
    score: points,
    maxScore: 7,
    passed: hasCommits >= 5,
    details:
      hasCommits >= 20
        ? 'Great commit history — shows consistent work'
        : hasCommits >= 10
          ? 'Good commit history — try to commit more regularly'
          : hasCommits >= 5
            ? 'Few commits — make sure to commit your progress more often'
            : 'Very few commits — start committing your work regularly',
  };
}

//calc the total score
export function calculateScore(data: {
  languages: Record<string, number>;
  hasActions: boolean;
  hasReadme: boolean;
  commitCount: number;
  hasTests: boolean;
  isActive: boolean;
  hasDescription: boolean;
}): AnalysisResult {
  const categories: ScoreCategory[] = [
    scoreLanguage(data.languages),
    scoreTesting(data.hasTests),
    scoreCICD(data.hasActions),
    scoreCommits(data.commitCount),
    scoreReadme(data.hasReadme),
    scoreActivity(data.isActive),
    scoreDescription(data.hasDescription),
  ];
  const totalScore = categories.reduce((sum, category) => {
    return sum + category.score;
  }, 0);

  return {
    totalScore,
    categories,
    recommendations: [],
    analyzedAt: new Date(),
  };
}
