import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 8787;

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. Set it before starting the server.');
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { question, context } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question required' });

    const system = `You are a helpful analyst. Answer using only the provided context from the dataset. 
If the answer is not in the context, say you don't have enough information. Cite items when helpful.`;

    const user = `Question:\n${question}\n\nContext:\n${context || '(none)'}\n\nAnswer:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() || '';
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LLM_error', details: err?.message || String(err) });
  }
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});