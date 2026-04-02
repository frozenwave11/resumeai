import { getClient, MODEL, corsHeaders } from "./_lib.js";

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { resumeText, jobDescription } = req.body;
  if (!resumeText) return res.status(400).json({ error: "resumeText required" });

  const jobPart = jobDescription
    ? `\nJob Description:\n${jobDescription}\n`
    : "";

  const prompt = `You are an expert ATS (Applicant Tracking System) and resume analyst.

Analyze the following resume${jobDescription ? " against the provided job description" : ""} and return ONLY a valid JSON object (no markdown, no explanation, no code fences) with this exact structure:
{
  "ats_score": <number 0-100>,
  "overall_grade": "<A/B/C/D/F>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "issues": [
    {
      "severity": "<high|medium|low>",
      "category": "<category>",
      "issue": "<description>",
      "fix": "<specific actionable fix>"
    }
  ],
  "keywords_missing": ["<keyword1>", "<keyword2>"],
  "keywords_found": ["<keyword1>", "<keyword2>"]
}

Resume:
${resumeText}
${jobPart}
Return ONLY the JSON object.`;

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    const parsed = JSON.parse(clean.substring(start, end + 1));
    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
