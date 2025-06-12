import 'dotenv/config'; // OR: import * as dotenv from 'dotenv'; dotenv.config();
import axios from 'axios';
import fs from 'fs'

const GITHUB_TOKEN = process.env.GITHUB_PAT;

if (!GITHUB_TOKEN) {
  throw new Error('❌ GITHUB_PAT not found in .env file!');
}

const HEADERS = {
  Authorization: `token ${GITHUB_TOKEN}`,
  'User-Agent': 'devops-scraper',
  Accept: 'application/vnd.github+json',
};

const SEARCH_TOPICS = ['devops', 'docker', 'terraform', 'cicd', 'ansible', 'kubernetes'];

interface GitHubIssue {
  repo: string;
  number: number;
  title: string;
  body: string;
  labels: string[];
  comments: { id: number; body: string; author: string }[];
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const searchRepositoriesByTopic = async (topic: string, perPage = 10): Promise<string[]> => {
  const url = `https://api.github.com/search/repositories`;
  try {
    const res = await axios.get(url, {
      headers: HEADERS,
      params: {
        q: `topic:${topic}`,
        sort: 'stars',
        order: 'desc',
        per_page: perPage,
      },
    });
    return res.data.items.map((repo: any) => repo.full_name); // "owner/repo"
  } catch (err) {
    console.error(`❌ Error fetching repos for topic ${topic}`, err);
    return [];
  }
};

const fetchIssuesFromRepo = async (repo: string, maxPages = 20): Promise<GitHubIssue[]> => {
  const allIssues: GitHubIssue[] = [];

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await axios.get(`https://api.github.com/repos/${repo}/issues`, {
        headers: HEADERS,
        params: {
          state: 'all',
          per_page: 30,
          page,
        },
      });

      for (const issue of res.data) {
        // Skip PRs
        if (issue.pull_request) continue;

        const labels = issue.labels.map((l: any) => l.name);

        // Fetch comments
        const commentsRes = await axios.get(issue.comments_url, { headers: HEADERS });
        const comments = commentsRes.data.map((c: any) => ({
          id: c.id,
          body: c.body,
          author: c.user?.login || 'unknown',
        }));

        allIssues.push({
          repo,
          number: issue.number,
          title: issue.title,
          body: issue.body,
          labels,
          comments,
        });

        await delay(300); // Delay to avoid rate limit
      }

      await delay(800); // Between pages
    } catch (err) {
      console.error(`❌ Error fetching issues from ${repo} page ${page}`, err);
    }
  }

  return allIssues;
};

const collectDevOpsIssues = async () => {
  const allIssuesMap = new Map<number, GitHubIssue>();

  for (const topic of SEARCH_TOPICS) {
    const repos = await searchRepositoriesByTopic(topic, 5); // top 5 repos per topic
    for (const repo of repos) {
      const issues = await fetchIssuesFromRepo(repo, 20); // 20 pages × 30 = up to 60 issues per repo
      for (const issue of issues) {
        allIssuesMap.set(issue.number + issue.repo.length, issue); // avoid collisions
      }
    }
  }

  const allIssues = Array.from(allIssuesMap.values());
  console.log(`✅ Collected ${allIssues.length} unique GitHub Issues`);
  

  return allIssues; 
};

// Main runner
(async () => {
  const issues = await collectDevOpsIssues();
  fs.writeFileSync('scraper/data/github_issues.json', JSON.stringify(issues, null,2))
  // You can now save to file, Redis, or vector DB
})();
