import snoowrap from 'snoowrap';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const r = new snoowrap({
  userAgent: 'troublemate-reddit-scraper',
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!
});

const SUBREDDITS = ['devops', 'docker', 'kubernetes', 'terraform', 'aws'];
const LIMIT = 100;

const fetchRedditPosts = async () => {
  const allQA: any[] = [];

  for (const sub of SUBREDDITS) {
    const posts = await r.getSubreddit(sub).getHot({ limit: LIMIT });

    for (const post of posts) {
      const comments = await post.comments.fetchMore({ amount: 5, skipReplies: true });

      const qa = {
        id: post.id,
        question: post.title,
        body: post.selftext || '',
        subreddit: sub,
        link: `https://reddit.com${post.permalink}`,
        answers: comments
          .filter(c => c.body && !c.stickied && c.body.length > 30)
          .map(c => ({
            id: c.id,
            body: c.body,
            score: c.score
          }))
      };

      if (qa.answers.length) {
        allQA.push(qa);
      }
    }
  }

  fs.writeFileSync('scraper/data/reddit_qa.json', JSON.stringify(allQA, null, 2));
  console.log(`✅ Collected ${allQA.length} Q&A pairs from Reddit`);
};

fetchRedditPosts();
