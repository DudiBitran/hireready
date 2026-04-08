import { auth } from '@/lib/auth';
import { getUserRepos, getRepoFilesList, getFileContent } from '@/lib/github';

export default async function Home() {
  const session = await auth();

  if (session?.accessToken) {
    const repos = await getUserRepos(session.accessToken);
    const firstRepo = repos[0];
    const owner = firstRepo.full_name.split('/')[0];

    const files = await getRepoFilesList(
      owner,
      firstRepo.name,
      session.accessToken
    );
    const content = await getFileContent(
      owner,
      firstRepo.name,
      files[2].path,
      session.accessToken
    );
    console.log(content);
  }

  return <div>HireReady</div>;
}
