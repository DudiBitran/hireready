import { GitHubRepo } from '@/types';

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

//checking if there is testing tools in the project

export async function hasTests(
  owner: string,
  repo: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
      },
    }
  );
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  const packageJson = JSON.parse(content);
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  const testingLibs = ['jest', 'vitest', 'cypress', 'testing-library'];
  return testingLibs.some((lib) => lib in deps);
}

//checking if the repo was updated in the past 6 months

export function isRecentlyActive(updatedAt: string): boolean {
  const sixMonthAgo = new Date();
  sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
  const lastUpdate = new Date(updatedAt);
  return lastUpdate > sixMonthAgo;
}

//checking ig the repo has description
export function hasDescription(description: string | null): boolean {
  return description !== null;
}

// get repos files

export async function getRepoFilesList(
  owner: string,
  repo: string,
  accessToken: string,
  path: string = '',
  depth: number = 0
): Promise<{ name: string; type: string; path: string }[]> {
  if (depth > 3) return [];

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
      },
    }
  );

  if (!response.ok) return [];

  const items = await response.json();
  const results: { name: string; type: string; path: string }[] = [];

  for (const item of items) {
    if (item.type === 'file') {
      results.push({ name: item.name, type: item.type, path: item.path });
    } else if (
      item.type === 'dir' &&
      !item.name.includes('node_modules') &&
      !item.name.startsWith('.')
    ) {
      const subFiles = await getRepoFilesList(
        owner,
        repo,
        accessToken,
        item.path,
        depth + 1
      );
      results.push(...subFiles);
    }
  }

  return results;
}

//get file content
export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: 'application/vnd.github+json',
      },
    }
  );
  if (!response.ok) {
    throw Error('failed to get files from the repository');
  }
  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  console.log(content);

  return content;
}
