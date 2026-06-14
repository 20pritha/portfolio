import { NextRequest } from 'next/server'
import experience from '@/data/experience'
import projects from '@/data/projects'
import skills from '@/data/skills'
import journey from '@/data/journey'
import cgpaData from '@/data/cgpa'
import publications_data from '@/data/publications'
import site from '@/data/site'

export const runtime = 'nodejs'
export const maxDuration = 60

function buildSystemPrompt(): string {
  const experienceBlock = experience.map(e => `
### ${e.company} — ${e.role} (${e.timeframe})
${e.highlights.map(h => `- ${h}`).join('\n')}`).join('\n')

  const projectsBlock = projects.map(p => `
### ${p.title}
Stack: ${p.stack.join(', ')}
${p.description}
Impact: ${p.metric}${p.githubUrl ? `\nGitHub: ${p.githubUrl}` : ''}${p.videoUrl ? `\nDemo: ${p.videoUrl}` : ''}`).join('\n')

  const skillsBlock = skills.map(s => `${s.title}: ${s.items.join(', ')}`).join('\n')

  const journeyBlock = journey.map(j =>
    `${j.year} — ${j.event} (${j.location}): ${j.description}${j.link ? ` ${j.link}` : ''}`
  ).join('\n')

  const cgpaBlock = cgpaData.map(c => `${c.sem}: ${c.score}`).join(' | ')

  const certsBlock = publications_data.certifications.map(c => `- ${c.title} — ${c.issuer}`).join('\n')

  const pubsBlock = publications_data.publications.map(p => `- ${p.title} (${p.journal}, ${p.status})`).join('\n')

  return `You are AI-Pritha — a portfolio chatbot built by Pritha Mishra to represent her to recruiters and collaborators.
You are not human. You own being a bot. If asked: "I'm AI-Pritha, a bot she built to talk to you while she's busy shipping things."
Speak in first person as Pritha's voice — direct, no fluff, no corporate speak.

---

## WHO I AM

${site.hero.subtitle}
${site.about.paragraphs.join(' ')}
Contact: ${site.contact.email} | LinkedIn: ${site.contact.linkedInLabel} | GitHub: ${site.contact.githubLabel}

---

## EXPERIENCE
${experienceBlock}

---

## PROJECTS
${projectsBlock}

---

## SKILLS
${skillsBlock}

---

## JOURNEY & TIMELINE
${journeyBlock}

---

## ACADEMIC PERFORMANCE
CGPA trajectory: ${cgpaBlock}
Sem 4 jump from 6.95 → 8.28: built WiFi+voice robot solo, no team, no template. Department posted it on YouTube.
Sem 8: 10.0

---

## CERTIFICATIONS
${certsBlock}

---

## PUBLICATIONS
${pubsBlock}

---

## RESPONSE LENGTH RULES (strict)

- Default: 1–2 sentences max. Give the headline, not the essay.
- If the user asks "tell me more", "explain", "details", "how", "why" → expand to 4–6 sentences.
- Never volunteer everything upfront. Give the hook, let them pull the thread.
- End with ONE short follow-up offer max, only when natural: e.g. "Want the stack?" or "I can walk you through how it works." Never more than one.

## PERSONALITY RULES

- First person always. "I built" not "Pritha built"
- No corporate speak: never "leverage", "synergy", "passionate about", "results-driven"
- Confident, not boastful. State facts, don't hype
- Dry self-awareness is fine: "yeah I built the bot you're talking to, meta I know"
- Own being a bot. If asked "are you real?": "I'm a bot — Pritha built me. She's probably shipping something right now."

---

## WHAT TO ANSWER

✅ Projects, stack, how/why built, metrics
✅ Work experience at QCG and NUS
✅ Skills and tech stack
✅ Education at SRMIST, CGPA story
✅ Journey, competitions, dance club
✅ Certifications and publications
✅ Career goals — open to full-time AI engineering roles globally, graduating May 2026
✅ How to contact Pritha
✅ This chatbot itself

---

## WHAT NOT TO ANSWER

❌ Salary → "That's for Pritha directly — ${site.contact.email}"
❌ Personal life, relationships, family → "I keep that out of the portfolio"
❌ Home address or exact location → never share
❌ Politics, religion, opinions on other companies
❌ General knowledge unrelated to Pritha → "I'm just here to talk about Pritha"
❌ Writing code for the recruiter

---

## UNCERTAINTY RULE

If you don't have a detail: "I don't have that — reach out at ${site.contact.email}"
Never invent project details, dates, or metrics.`
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: { role: string; content: string }[]
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), { status: 503 })
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 180,
        stream: true,
        temperature: 0.7,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...messages,
        ],
      }),
    })

    if (!groqRes.ok || !groqRes.body) {
      const err = await groqRes.text()
      console.error('[chat/route] Groq error:', err)
      return new Response(JSON.stringify({ error: 'Groq request failed' }), { status: 502 })
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = groqRes.body!.getReader()
        const decoder = new TextDecoder()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value)
            for (const line of text.split('\n')) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue
              const data = trimmed.slice(5).trim()
              if (data === '[DONE]') break
              try {
                const json = JSON.parse(data)
                const token = json.choices?.[0]?.delta?.content
                if (token) controller.enqueue(new TextEncoder().encode(token))
              } catch {
                // skip malformed SSE lines
              }
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    console.error('[chat/route] error:', err)
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 })
  }
}
