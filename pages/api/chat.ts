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

function buildPrompt(query: string, docs: any[], history: { role: string, content: string }[] = []) {
  let historyText = '';
  if (history.length > 0) {
    historyText = history.map(msg =>
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
  }
  const context = docs.map((d: any, i: number) => `Context ${i + 1}: ${d.text}`).join('\n\n');
  console.log("Context for LLM:", context);
  
  return `You are an expert DevOps engineer and system administrator with 10+ years of experience. You specialize in troubleshooting, infrastructure management, and providing clear, actionable solutions.

IMPORTANT: Always structure your responses in this format:
1. Problem Analysis - Briefly identify the issue
2. Root Cause - Explain what's causing the problem
3. Solution Steps - Provide step-by-step instructions
4. Verification - How to confirm the fix worked
5. Prevention - How to avoid this issue in the future

Use the following context information to provide a comprehensive answer:

${context}

${historyText ? 'Conversation history:\n' + historyText + '\n' : ''}Question: ${query}

If the user's question is not related to DevOps, system administration, cloud, infrastructure, CI/CD, Linux, troubleshooting, or similar technical topics, reply strictly with: "I am a DevOps assistant. Please ask relevant questions."

Provide a detailed, professional response following the structure above if the question is relevant. Include specific commands, code examples, and best practices where relevant.`;
}

async function queryGroq(prompt: string) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: `You are an expert DevOps engineer and system administrator with extensive experience in:
- Linux/Unix systems administration
- Docker and containerization
- Kubernetes orchestration
- CI/CD pipelines
- Cloud platforms (AWS, Azure, GCP)
- Infrastructure as Code (Terraform, Ansible)
- Monitoring and logging (Prometheus, ELK stack)
- Network troubleshooting
- Security best practices

Your responses should be:
- Professional and authoritative
- Well-structured with clear sections
- Include specific commands and code examples
- Focus on practical, actionable solutions
- Explain the reasoning behind recommendations
- Consider security implications
- Provide verification steps
- For "Hi Hello" type of questions, just say "Hello, how can I help you today?"
- For "How are you" type of questions, just say "I'm doing great, thank you for asking!"
- For "What is your name" type of questions, just say "I'm Troublemate AI, your AI assistant!"
- For "What is your purpose" type of questions, just say "I'm here to help you with your DevOps and system administration questions!"
- For "What is your favorite color" type of questions, just say "I'm a helpful AI assistant, not a color!"
- For "What is your favorite food" type of questions, just say "I'm a helpful AI assistant, not a food!"
- For "What is your favorite animal" type of questions, just say "I'm a helpful AI assistant, not an animal!"
- For "What is your favorite movie" type of questions, just say "I'm a helpful AI assistant, not a movie!"

Always prioritize safety and best practices in your recommendations.`
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.2,
    }),
  });

  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() || "Sorry, no answer.";
}

function formatAnswer(text: string) {
  return text
    // Clean up the text first
    .trim()
    
    // Fix section headers with plain text formatting
    .replace(/^1\.\s?\*\*Problem Analysis\*\*:?\s*/gim, '\n\nProblem Analysis\n\n')
    .replace(/^1\.\s?Problem Analysis:?\s*/gim, '\n\nProblem Analysis\n\n')
    
    .replace(/^2\.\s?\*\*Root Cause\*\*:?\s*/gim, '\n\nRoot Cause\n\n')
    .replace(/^2\.\s?Root Cause:?\s*/gim, '\n\nRoot Cause\n\n')
    
    .replace(/^3\.\s?\*\*Solution Steps\*\*:?\s*/gim, '\n\nSolution Steps\n\n')
    .replace(/^3\.\s?Solution Steps:?\s*/gim, '\n\nSolution Steps\n\n')
    
    .replace(/^4\.\s?\*\*Verification\*\*:?\s*/gim, '\n\nVerification\n\n')
    .replace(/^4\.\s?Verification:?\s*/gim, '\n\nVerification\n\n')
    
    .replace(/^5\.\s?\*\*Prevention\*\*:?\s*/gim, '\n\nPrevention\n\n')
    .replace(/^5\.\s?Prevention:?\s*/gim, '\n\nPrevention\n\n')
    
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^##\s+/gm, '\n\n')
    .replace(/^###\s+/gm, '\n\n')
    
    // Fix bullet points
    .replace(/^[-*]\s+/gm, '• ')
    
    // Fix numbered lists
    .replace(/^(\d+)\.\s+/gm, '$1. ')
    
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/gm, '')
    
    // Ensure proper spacing around headers
    .replace(/\n##/g, '\n\n##')
    .replace(/\n###/g, '\n\n###')
    
    .trim();
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("METHOD:", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { query, user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'User ID required' });

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid query' });
  }

  try {
    // Fetch last 4 messages (2 user+assistant pairs) for this user
    const { data: chatHistory, error: historyError } = await supabase
      .from('chats')
      .select('question,answer')
      .eq('user_id', user_id)
      .order('id', { ascending: false })
      .limit(2);
    let history: { role: string, content: string }[] = [];
    if (chatHistory && chatHistory.length > 0) {
      // Each chatHistory row is a user question and assistant answer
      // Reverse to chronological order
      history = chatHistory.reverse().flatMap(row => [
        { role: 'user', content: row.question },
        { role: 'assistant', content: row.answer },
      ]);
    }

    // Check for simple greetings first
    const lowerQuery = query.toLowerCase().trim();
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const howAreYou = ['how are you', 'how are you doing', 'how do you do'];
    const nameQuestions = ['what is your name', 'what\'s your name', 'who are you'];
    const purposeQuestions = ['what is your purpose', 'what do you do', 'what can you do'];
    const favoriteQuestions = ['what is your favorite color', 'what is your favorite food', 'what is your favorite animal', 'what is your favorite movie'];

    let directAnswer = '';
    
    if (greetings.some(greeting => lowerQuery.includes(greeting))) {
      directAnswer = 'Hello, how can I help you today?';
    } else if (howAreYou.some(phrase => lowerQuery.includes(phrase))) {
      directAnswer = 'I\'m doing great, thank you for asking!';
    } else if (nameQuestions.some(phrase => lowerQuery.includes(phrase))) {
      directAnswer = 'I\'m Troublemate AI, your AI assistant!';
    } else if (purposeQuestions.some(phrase => lowerQuery.includes(phrase))) {
      directAnswer = 'I\'m here to help you with your DevOps and system administration questions!';
    } else if (favoriteQuestions.some(phrase => lowerQuery.includes(phrase))) {
      directAnswer = 'I\'m a helpful AI assistant, not a person with favorites!';
    }

    if (directAnswer) {
      // Cache the direct answer
      await redis.set(query, directAnswer, 'EX', 60 * 60 * 24); // 24h
      await supabase
        .from('chats')
        .insert([
          {
            user_id,
            question: query,
            answer: directAnswer,
          }
        ]);
      
      return res.status(200).json({ formattedAnswer: directAnswer, source: 'direct' });
    }

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
      prompt = buildPrompt(query, results, history);
      source = 'faiss+llm';
    } else {
      prompt = buildPrompt(query, [], history);
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
