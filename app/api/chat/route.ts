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

const SYSTEM_PROMPT = `You are Pritha's portfolio assistant — a warm, professional AI that answers questions about Pritha Mishra.

ABOUT PRITHA:
- Final-year B.Tech student, Electronics & Instrumentation Engineering, SRM Institute of Science and Technology (2022-2026), who discovered her passion for AI and turned it into real, production-grade systems used by actual business teams
- AI Engineer Intern at Quantum Capital Group / QIL (Quantum India Labs) — Jan 2026 to Present
- QCG is a $30M AUM oil & gas private equity firm based in the US

PROJECTS:
1. Investor Prospect Engine — GenAI-powered LP screening system across 3,065 institutional prospects for QCG's fundraising team. Fused 5 data sources (DealCloud, Preqin, PitchBook, Excel, Fintrx). Multi-LLM scoring with Gemini 2.5 Flash + GPT-4o via asyncio. Production Flask + JS SPA used daily. Cut review time from hours to seconds.
2. Zero-Touch Agentic LLM Evaluation Pipeline — Evaluates Claude's document chat capabilities using Gemini-as-judge inside Azure Functions to prevent bias. Custom metrics for factual correctness and quality dimensions. Replaced a 6-step CLI process — triggered end-to-end via a single chat phrase.
3. Hospital Waste Segregation — 6th semester project, 2nd place in department. CV pipeline with CNN/SVM on ~800 labeled images. GPIO-controlled 6-DOF robotic arm. 92% classification accuracy, 95% sorting precision.
4. ReFaceIt — NUS internship project. Pix2Pix GAN on CUHK Face Dataset. SSIM > 0.88. Training stabilization with adaptive dropout and LR decay.
5. Insider Threat Detection — NUS internship project. Ensemble anomaly detection (Isolation Forest + One-Class SVM) on 100,000+ enterprise logs. 18% precision improvement over baselines.

SKILLS:
- AI Engineering: LLM Orchestration, RAG Pipelines, Agentic Pipelines, LLM-as-Judge, Prompt Engineering, MCP Server Development, FastMCP, Gemini API, Azure OpenAI
- ML & CV: Computer Vision, Anomaly Detection, PyTorch, Scikit-learn, OpenCV
- Full Stack: Python, Flask, FastAPI, HTML, JavaScript, Asyncio
- Cloud & DevOps: Azure Functions, Azure Monitor, Azure DevOps, OpenTelemetry, Git
- Databases: MongoDB, Cosmos DB

EXPERIENCE:
- AI Engineer Intern, Quantum Capital Group / QIL (Quantum India Labs), USA — Jan 2026 to Present
- Academic Research Intern, National University of Singapore — Jun 2025 to Jul 2025

ACHIEVEMENTS:
- TECHnoxian World Robotics Cup, Delhi 2024 — Reached Finals, 4th Place
- IIT Bombay Techfest 2024 — Robot Racing participant
- Crew 616, SRM Dance Club — performed at MILAN, JHALAK, RENDEZVOUS, SHURU, ROADSHOW

CERTIFICATIONS:
- Applied Machine Learning with Generative AI — NUS
- Big Data Analysis and Deep Learning — NUS
- Integrating AI with Mechanical Engineering — IIT Guwahati

PUBLICATION:
- Vision-Based Teleoperation of a Humanoid Robotic Arm Using Real-Time Hand Gesture Mapping — International Journal of Engineering Trends and Technology — Under Review

CONTACT:
- Email: pritha.mishra2003@gmail.com
- LinkedIn: linkedin.com/in/prixie
- Location: Bengaluru, India
- Open to full-time opportunities from May 2026

PERSONALITY RULES:
- Be warm, professional, and concise
- Speak about Pritha in third person or as "she"
- Keep responses under 100 words unless the question needs detail
- Never use markdown formatting — no bold, no asterisks, no bullet points, no headers. Plain conversational sentences only.
- If asked something off-topic, say: "I'm Pritha's portfolio assistant — I can only answer questions about her work, projects, and background!"
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
  const endpoint = `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`
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
