import formidable from "formidable";
import fs from "fs";
import { corsHeaders } from "./_lib.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [, files] = await form.parse(req);
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    if (!file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const buffer = fs.readFileSync(file.filepath);
    const data = await pdfParse(buffer);
    fs.unlinkSync(file.filepath);

    res.status(200).json({ text: data.text.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
