import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import { supabase } from '../../utils/supabaseClient';

const redis = new Redis(process.env.REDIS_URL!);
const FAISS_API_URL = process.env.BACKEND_URL!;

// const HF_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
// const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY!;

async function queryFaiss(query: string) {
  const res = await fetch(FAISS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

function buildPrompt(query: string, docs: any[]) {
  const context = docs.map((d: any, i: number) => `Context ${i + 1}: ${d.text}`).join('\n\n');
  console.log("📄 Context for LLM:", context);
  return `Use the following information to answer the question.\n\n${context}\n\nQuestion: ${query}\nAnswer:`;
}

// async function queryHuggingFace(prompt: string) {
//   console.log("💬 Sending prompt to Hugging Face:", prompt);
//   const res = await fetch(HF_API_URL, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${HF_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       inputs: prompt,
//       parameters: { max_new_tokens: 500, temperature: 0.3 },
//     }),
//   });

//   if (!res.ok) throw new Error('Hugging Face API error');
//   const json = await res.json();
//   const answer = Array.isArray(json) ? json[0]?.generated_text : json.generated_text;
//   return answer?.trim() || 'Sorry, I could not generate a valid response.';
// }
async function queryGroq(prompt: string) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "mistral-saba-24b",
      messages: [
        { role: "system", content: "You are a helpful DevOps assistant.You help with error solving" },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() || "Sorry, no answer.";
}

function formatAnswer(text: string) {
  return text
    // Headings and sections
    .replace(/^##\s?/gm, '### ')
    .replace(/^###?\s?(.+)/gm, (_, title) => `\n🔹 **${title.trim()}**\n`)
    // Labels
    .replace(/(?<=^|\n)-\s?\*\*Error Message\*\*:/gi, '❗ **Error Message**:')
    .replace(/(?<=^|\n)-\s?\*\*Solution\*\*:/gi, '🛠️ **Solution**:')
    .replace(/(?<=^|\n)-\s?\*\*Command Used\*\*:/gi, '💻 **Command Used**:')
    .replace(/(?<=^|\n)-\s?\*\*Context\*\*:/gi, '🧠 **Context**:')
    // Bullet points
    .replace(/^- /gm, '• ')
    // Condense multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("METHOD:", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { query, user_id  } = req.body;
  if (!user_id) return res.status(400).json({ error: 'User ID required' });

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid query' });
  }

  try {
    // 1. Redis cache
    const cached = await redis.get(query);
    console.log("Checking Redis");
    if (cached) return res.status(200).json({ answer: cached, source: 'cache' });

    // 2. FAISS search
    let results = [];
    try {
      console.log("Querying FAISS with:");
      results = await queryFaiss(query);
    } catch (err) {
      console.warn('FAISS query failed', err);
    }

    let prompt = query;
    let source = 'llm';

    if (results.length > 0) {
      prompt = buildPrompt(query, results);
      source = 'faiss+llm';
    }

    // 3. Query GROK LLM
    const answer = await queryGroq(prompt);
    console.log("Generated answer:", answer);
    // 4. Cache answer
    await redis.set(query, answer, 'EX', 60 * 60 * 24); // 24h
    const formattedAnswer = formatAnswer(answer);
    await supabase
  .from('chats')
  .insert([
    {
      user_id,
      question: query,
      answer: formattedAnswer,
    }
  ]);

    res.status(200).json({ formattedAnswer, source });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
