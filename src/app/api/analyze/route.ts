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

export async function POST() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = session.accessToken as string;
  const userRepos = await getUserRepos(token);
  const analyses = await Promise.all(
    userRepos.map(async (repo) => {
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
      return score;
    })
  );
  return NextResponse.json({ analyses });
}
