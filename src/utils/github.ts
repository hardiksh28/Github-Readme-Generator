export interface RepoData {
  owner: string;
  repo: string;
  defaultBranch?: string;
  description?: string;
  language?: string;
  files: string[];
  packageJson?: any;
}

export const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  } catch (e) {
    // Also try simple owner/repo format
    const parts = url.split('/').filter(Boolean);
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  }
};

export const fetchRepoData = async (url: string, onProgress: (step: string) => void): Promise<RepoData> => {
  const parsed = parseGithubUrl(url);
  if (!parsed) {
    throw new Error('Invalid GitHub URL. Please provide a valid repository URL like https://github.com/facebook/react');
  }

  const { owner, repo } = parsed;

  onProgress('Fetching repository metadata...');
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoRes.ok) {
    if (repoRes.status === 404) throw new Error('Repository not found. It might be private.');
    if (repoRes.status === 403) throw new Error('API rate limit exceeded.');
    throw new Error(`GitHub API error: ${repoRes.statusText}`);
  }
  const repoJson = await repoRes.json();
  const defaultBranch = repoJson.default_branch;

  onProgress('Analyzing project structure...');
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
  if (!treeRes.ok) {
    throw new Error('Failed to fetch repository tree.');
  }
  const treeJson = await treeRes.json();
  const files = treeJson.tree.map((item: any) => item.path);

  let packageJson = null;
  if (files.includes('package.json')) {
    onProgress('Extracting dependencies...');
    const pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`);
    if (pkgRes.ok) {
      try {
        packageJson = await pkgRes.json();
      } catch (e) {
        console.warn('Failed to parse package.json');
      }
    }
  } else if (files.includes('requirements.txt')) {
    onProgress('Extracting Python dependencies...');
    // We could fetch requirements.txt but let's keep it simple
  }

  onProgress('Analysis complete.');

  return {
    owner,
    repo,
    defaultBranch,
    description: repoJson.description,
    language: repoJson.language,
    files,
    packageJson,
  };
};
