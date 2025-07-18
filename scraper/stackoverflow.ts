import axios from 'axios';
import fs from 'fs';

interface Answer {
  answer_id: number;
  body: string;
  is_accepted: boolean;
  score: number;
}

interface Question {
  question_id: number;
  title: string;
  body: string;
  tags: string[];
  link: string;
  answers?: Answer[];
}

interface StackExchangeResponse {
  items: Question[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
}

const STACK_EXCHANGE_API = 'https://api.stackexchange.com/2.3';
const SITE = 'stackoverflow';

const TAGS = [
  'devops', 'terraform', 'cicd', 'docker', 'kubernetes', 'jenkins', 'ansible',
  'aws', 'azure', 'gcp', 'helm', 'prometheus', 'grafana', 'monitoring', 
  'linux', 'shell', 'bash', 'puppet', 'chef', 'cloudformation'
];

interface QAPair {
  id: number;
  question: string;
  question_body: string;
  tags: string[];
  link: string;
  answers: {
    id: number;
    body: string;
    is_accepted: boolean;
    score: number;
  }[];
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const fetchQuestionsByTag = async (tag: string, page: number): Promise<StackExchangeResponse | null> => {
  try {
    const { data } = await axios.get<StackExchangeResponse>(`${STACK_EXCHANGE_API}/questions`, {
      params: {
        site: SITE,
        tagged: tag,
        pagesize: 100,
        page,
        order: 'desc',
        sort: 'votes',
        filter: '!9_bDE(fI5', // includes body and answers
      },
    });
    return data;
  } catch (error) {
    console.error(`Error fetching tag ${tag} (page ${page}):`, error);
    return null;
  }
};

const fetchAllQuestions = async (tags: string[], maxPages: number): Promise<QAPair[]> => {
  const qMap = new Map<number, QAPair>();

  for (const tag of tags) {
    for (let page = 1; page <= maxPages; page++) {
      const data = await fetchQuestionsByTag(tag, page);
      if (!data || !data.items) break;

      for (const question of data.items) {
        if (!qMap.has(question.question_id)) {
          const qa: QAPair = {
            id: question.question_id,
            question: question.title,
            question_body: question.body,
            tags: question.tags,
            link: question.link,
            answers: [],
          };

          if (question.answers) {
            for (const ans of question.answers) {
              qa.answers.push({
                id: ans.answer_id,
                body: ans.body,
                is_accepted: ans.is_accepted,
                score: ans.score,
              });
            }
          }

          qMap.set(question.question_id, qa);
        }
      }

      if (!data.has_more) break;
      await delay(500); // wait 500ms to avoid hitting API limits
    }
  }

  return Array.from(qMap.values());
};

// Run the main logic
(async () => {
  const allQAs = await fetchAllQuestions(TAGS, 5); // 5 pages per tag
  console.log(`✅ Fetched ${allQAs.length} unique Q&A pairs from Stack Overflow.`);
    fs.writeFileSync('scraper/data/stackoverflow_data.json', JSON.stringify(allQAs, null, 2));

})();

