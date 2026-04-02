import { getClient, streamToResponse, corsHeaders } from "./_lib.js";

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { resumeText, jobDescription, companyName, tone } = req.body;
  if (!resumeText || !jobDescription)
    return res.status(400).json({ error: "resumeText and jobDescription required" });

  const company = companyName || "the company";
  const letterTone = tone || "professional yet personable";

  const prompt = `You are an expert cover letter writer. Write a compelling cover letter for the following applicant applying to ${company}.

Tone: ${letterTone}
Length: 3-4 paragraphs

Rules:
- Opening: Hook with a specific achievement or genuine connection — never start with "I am writing to apply for..."
- Body: Connect 2-3 specific experiences/skills directly to the job requirements
- Closing: Confident call to action
- Write as a complete, ready-to-send letter — no placeholders like [Your Name]
- Do NOT include any explanation or commentary, just the letter

Resume:
${resumeText}

Job Description:
${jobDescription}`;

  try {
    const client = getClient();
    await streamToResponse(client, prompt, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
}
