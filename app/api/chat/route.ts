import { NextRequest, NextResponse } from 'next/server'

// Node runtime (not edge): HF cold starts can take 30-60s.
// Edge runtime times out at 25s on Vercel free tier — not enough.
export const runtime = 'nodejs'
export const maxDuration = 60

const HF_API_TOKEN = process.env.HF_API_TOKEN
const HF_MODEL_ID = process.env.HF_MODEL_ID

// Fallback to Groq while the fine-tuned model is being trained/uploaded.
// Once HF_MODEL_ID is set and the model is live, this path is never hit.
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are Pritha's portfolio assistant — warm, sharp, conversational. Only answer questions about Pritha Mishra. For off-topic questions say exactly: I'm Pritha's portfolio assistant — I can only answer questions about her work and background!

ABOUT PRITHA:
Final-year B.Tech EIE student at SRMIST (2022-2026). AI Intern at Quantum Capital Group (QCG) — a $30M AUM US oil & gas private equity firm — working from Quantum India Labs (QIL) in Bengaluru. Jan 2026 to present. Previously research intern at NUS (Jun-Jul 2025). Graduating May 2026, open to full-time AI roles globally.

PROJECTS:
1. Investor Prospect Engine — GenAI LP screening across 3,065 institutional prospects (each hundreds of millions AUM) for QCG's fundraising team. Fuses DealCloud, Preqin, PitchBook, Excel, Fintrx. Multi-LLM scoring: Gemini 2.5 Flash + GPT-4o via asyncio. Flask + JS SPA, MongoDB. Cut review time from hours to seconds.
2. Zero-Touch Agentic LLM Eval Pipeline — Evaluates Claude's document chat system. Gemini 2.5 Flash judges inside Azure Functions (isolated from Claude's context to prevent bias). Custom metrics: factual correctness + quality dimensions. Replaced a 6-step manual CLI workflow — now triggers end-to-end from one chat phrase: "run eval".
3. Hospital Waste Segregation — 6th sem project, 2nd place in department. CNN/SVM on 800 images, GPIO-controlled 6-DOF robotic arm. 92% accuracy, 95% sorting precision.
4. ReFaceIt — NUS project. Pix2Pix GAN on CUHK Face Dataset. SSIM > 0.88. Stabilised with adaptive dropout + LR decay. On GitHub.
5. Insider Threat Detection — NUS project. Isolation Forest + One-Class SVM ensemble on 100K+ enterprise logs. 18% precision improvement. On GitHub.

SKILLS: LLM Orchestration, RAG, Agentic Pipelines, LLM-as-Judge, FastMCP, Gemini API, Azure OpenAI (Claude/GPT-4o), PyTorch, Scikit-learn, OpenCV, Python, Flask, FastAPI, asyncio, JavaScript, Azure Functions/Monitor/DevOps, OpenTelemetry, MongoDB, Cosmos DB.

ACHIEVEMENTS: TECHnoxian World Robotics Cup Delhi 2024 — Finals, 4th place. IIT Bombay Techfest 2024 — Robot Racing. Crew 616 SRM Dance Club — MILAN, JHALAK, RENDEZVOUS, SHURU, ROADSHOW.

CGPA: Started at 7.0. Turned around in Sem 4 after building a WiFi-controlled talking robot solo (on YouTube, dept posted it). Hit 10.0 in final semester.

CERTS: Applied ML with GenAI (NUS), Big Data Analysis & Deep Learning (NUS), Integrating AI with Mechanical Engineering (IIT Guwahati).

PUBLICATION: Vision-Based Teleoperation of a Humanoid Robotic Arm Using Real-Time Hand Gesture Mapping — IJETT — Under Review.

CONTACT: pritha.mishra2003@gmail.com / linkedin.com/in/prixie / Bengaluru, India.

RESPONSE RULES (strict):
- NEVER start with "Pritha", "She", or "Her"
- Open with: Currently..., So she's..., Right now..., Built entirely solo —, One of her best..., That would be..., Think of it as..., Honestly,
- NEVER exceed 600 characters
- 1-5 word questions → 80 chars max. Simple factual → 100 chars. Role/background → 200 chars. Project → 400 chars. Recruiter/deep-dive → 600 chars.
- Sound like a text to a friend, not a company website
- Use em-dashes for punchy asides — like this
- One sharp specific detail beats three vague sentences
- Echo a word from the question in the response
- NEVER say: "Pritha is currently", "Pritha has", "She has experience in", "She is passionate about", "She is a", "In her role", "As an intern", "Additionally", "Furthermore", "Moreover"
- No bullet points, no bold, no markdown formatting
- 30% of responses end with a light follow-up hook: "...want the details on that?" / "...that project alone is worth a conversation" / "...the YouTube video is wild if you want the link"
- Show don't tell: never say "hardworking" — say what she built. Never say "quick learner" — say what she learned and when.
- Dismissive questions → confident not defensive: "Pretty good — she shipped a production GenAI system to a US PE firm as a final-year undergrad."
- Never make up information not listed above`

// Build ChatML prompt for Qwen2.5-Instruct.
// Must exactly match the format used during fine-tuning — the model learned to
// generate after the final <|im_start|>assistant\n token.
function buildChatMLPrompt(messages: { role: string; content: string }[]): string {
  let prompt = `<|im_start|>system\n${SYSTEM_PROMPT}<|im_end|>\n`
  for (const msg of messages) {
    const role = msg.role === 'user' ? 'user' : 'assistant'
    prompt += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`
  }
  prompt += `<|im_start|>assistant\n`
  return prompt
}

async function callHuggingFace(
  messages: { role: string; content: string }[]
): Promise<string> {
  const endpoint = `https://router.huggingface.co/hf-inference/models/${HF_MODEL_ID}`
  const prompt = buildChatMLPrompt(messages)
  const MAX_RETRIES = 3
  const RETRY_DELAY_MS = 5000

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
          stop: ['<|im_end|>', '<|im_start|>'],
        },
      }),
    })

    if (res.status === 429) {
      return "I'm getting a lot of questions right now — please try again in a moment!"
    }

    // 503 = HF cold start — model is loading from disk
    if (res.status === 503) {
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
        continue
      }
      return '__warming_up__'
    }

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`HF API ${res.status}: ${body}`)
    }

    const data = await res.json() as Array<{ generated_text: string }>
    if (!Array.isArray(data) || !data[0]?.generated_text) {
      throw new Error('Unexpected HF response shape')
    }

    const reply = data[0].generated_text
      .replace(/<\|im_end\|>.*/s, '')
      .replace(/<\|im_start\|>.*/s, '')
      .trim()

    return reply || "I didn't quite catch that — could you rephrase?"
  }

  return '__warming_up__'
}

async function callGroqFallback(
  messages: { role: string; content: string }[]
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      stream: false,
      max_tokens: 200,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  return data.choices[0]?.message?.content?.trim() ?? 'Something went wrong.'
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: { role: string; content: string }[]
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    let message: string

    if (HF_MODEL_ID && HF_API_TOKEN) {
      // Fine-tuned SLM path
      message = await callHuggingFace(messages)
    } else if (GROQ_API_KEY) {
      // Fallback while model is being trained — remove once HF vars are set
      message = await callGroqFallback(messages)
    } else {
      return NextResponse.json(
        { error: 'No AI backend configured. Set HF_MODEL_ID + HF_API_TOKEN in env.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ message })
  } catch (err) {
    console.error('[chat/route] error:', err)
    return NextResponse.json(
      { message: 'Something went wrong — please try again!' },
      { status: 500 }
    )
  }
}
