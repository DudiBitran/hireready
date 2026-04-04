import { GitHubRepo } from '@/types';

export async function getUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const response = await fetch(
    'https://api.github.com/user/repos?per_page=100&sort=updated',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
      },
    }
  );
  if (!response.ok) {
    throw Error('failed to get repositories');
  }
  const data = await response.json();
  return data as GitHubRepo[];
}
