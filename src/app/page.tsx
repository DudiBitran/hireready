import { auth } from '@/lib/auth';
import { getUserRepos } from '@/lib/github';

export default async function Home() {
  const session = await auth();
  if (session?.accessToken) {
    const repos = await getUserRepos(session.accessToken);
  }

  return <h1>HireReady</h1>;
}
