import { GitHubRepo } from '@/types';
import { headers } from 'next/headers';

// get the whole user repos
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
    throw Error('Failed to get repositories');
  }
  const data = await response.json();
  return data as GitHubRepo[];
}

// Checking the languages in the repos

export async function getRepoLanguages(
  owner: string,
  repo: string,
  accessToken: string
): Promise<Record<string, number>> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/languages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
      },
    }
  );
  if (!response.ok) {
    throw Error('Failed to get the languages');
  }
  const data = await response.json();
  return data;
}

//checking if repo has workflow

export async function hasGithubActions(
  owner: string,
  repo: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
      },
    }
  );
  if (!response.ok) {
    throw Error('Failed to get the repo workflow');
  }
  const data = await response.json();
  console.log(data);

  return data.total_count > 0;
}

//checking if repo has a README
export async function hasReadme(
  owner: string,
  repo: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
      },
    }
  );
  return response.status === 200;
}

// get the commit count of the repos

export async function getCommitCount(
  owner: string,
  repo: string,
  accessToken: string
): Promise<number> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
      },
    }
  );
  if (!response.ok) {
    throw Error('Failed to get repo commit');
  }
  const data = await response.json();
  return data.length;
}
