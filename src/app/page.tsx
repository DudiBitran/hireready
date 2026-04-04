import { auth } from '@/lib/auth';
import {
  getUserRepos,
  getCommitCount,
  getRepoLanguages,
  hasGithubActions,
  hasReadme,
  hasTests,
  isRecentlyActive,
  hasDescription,
} from '@/lib/github';

export default async function Home() {
  const session = await auth();
  if (session?.accessToken) {
    const repos = await getUserRepos(session.accessToken);
    const firstRepo = repos[0];
    const owner = firstRepo.full_name.split('/')[0];

    const [languages, actions, readme, commits, tests] = await Promise.all([
      getRepoLanguages(
        firstRepo.full_name.split('/')[0],
        firstRepo.name,
        session.accessToken
      ),
      hasGithubActions(
        firstRepo.full_name.split('/')[0],
        firstRepo.name,
        session.accessToken
      ),
      hasReadme(
        firstRepo.full_name.split('/')[0],
        firstRepo.name,
        session.accessToken
      ),
      getCommitCount(
        firstRepo.full_name.split('/')[0],
        firstRepo.name,
        session.accessToken
      ),
      hasTests(owner, firstRepo.name, session.accessToken),
    ]);
    const active = isRecentlyActive(firstRepo.updated_at);
    const description = hasDescription(firstRepo.description);

    console.log({
      languages,
      actions,
      readme,
      commits,
      tests,
      active,
      description,
    });
  }

  return <h1>HireReady</h1>;
}
