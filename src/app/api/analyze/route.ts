import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getCommitCount,
  getUserRepos,
  getRepoLanguages,
  hasDescription,
  hasGithubActions,
  hasReadme,
  hasTests,
  isRecentlyActive,
} from '@/lib/github';
import { calculateScore } from '@/lib/scoring';
import { analyzeOverall, analyzeWithAI } from '@/lib/claude';

export async function POST() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = session.accessToken as string;
  const userRepos = await getUserRepos(token);
  const meaningfulRepos = userRepos
    .filter((repo) => !repo.fork)
    .filter((repo) => isRecentlyActive(repo.updated_at))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);

  const analyses = await Promise.all(
    meaningfulRepos.map(async (repo) => {
      const owner = repo.full_name.split('/')[0];
      const [languages, actions, readme, commits, tests] = await Promise.all([
        getRepoLanguages(owner, repo.name, token),
        hasGithubActions(owner, repo.name, token),
        hasReadme(owner, repo.name, token),
        getCommitCount(owner, repo.name, token),
        hasTests(owner, repo.name, token),
      ]);

      const score = calculateScore({
        languages,
        hasActions: actions,
        hasReadme: readme,
        commitCount: commits,
        hasTests: tests,
        isActive: isRecentlyActive(repo.updated_at),
        hasDescription: hasDescription(repo.description),
      });

      return {
        score,
        rawData: {
          name: repo.name,
          languages,
          hasTests: tests,
          hasCI: actions,
          commitCount: commits,
          hasReadme: readme,
        },
      };
    })
  );

  const aiReviews = await analyzeWithAI(analyses.map((a) => a.rawData));
  const overallFeedback = await analyzeOverall(
    analyses.map((a, index) => ({
      ...a.rawData,
      score: analyses[index].score.totalScore + aiReviews[index].score,
    }))
  );

  const finalAnalyses = analyses.map((analysis, index) => ({
    repoName: analysis.rawData.name,
    ...analysis.score,
    totalScore: analysis.score.totalScore + aiReviews[index].score,
    recommendations: aiReviews[index].recommendations,
    categories: [
      ...analysis.score.categories,
      {
        name: 'AI Code Review',
        score: aiReviews[index].score,
        maxScore: 30,
        passed: aiReviews[index].score >= 15,
        details: `AI reviewed your code quality — ${aiReviews[index].score}/30`,
      },
    ],
  }));

  return NextResponse.json({
    overallScore: Math.round(
      finalAnalyses.reduce((sum, a) => sum + a.totalScore, 0) /
        finalAnalyses.length
    ),
    overallFeedback,
    repos: finalAnalyses,
  });
}
