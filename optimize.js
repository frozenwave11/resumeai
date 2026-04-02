import { getClient, streamToResponse, corsHeaders } from "./_lib.js";

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { resumeText, jobDescription, tone } = req.body;
  if (!resumeText) return res.status(400).json({ error: "resumeText required" });

  const jobPart = jobDescription
    ? `\nTarget Job Description:\n${jobDescription}\n`
    : "";
  const tonePart = tone || "professional and impactful";

  const prompt = `You are an expert resume writer. Rewrite and optimize the following resume to be ${tonePart}.

Rules:
- Use strong action verbs (Led, Developed, Achieved, Implemented, Delivered, etc.)
- Quantify achievements where possible — add placeholders like [X%] or [N users] if numbers are missing
- Optimize for ATS keyword matching${jobDescription ? " based on the job description" : ""}
- Keep all factual information intact, only improve wording and structure
- Return the complete optimized resume, properly formatted
- Do NOT add any explanation, preamble, or commentary — just the resume

Resume:
${resumeText}
${jobPart}`;

  try {
    const client = getClient();
    await streamToResponse(client, prompt, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
}
