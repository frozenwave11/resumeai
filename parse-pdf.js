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

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const mime = file.mimetype || "";
    const name = (file.originalFilename || "").toLowerCase();
    const buffer = fs.readFileSync(file.filepath);

    let text = "";

    if (mime === "application/pdf" || name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx")
    ) {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return res.status(400).json({ error: "Only PDF and DOCX files are supported" });
    }

    fs.unlinkSync(file.filepath);
    res.status(200).json({ text: text.trim() });
  } catch (err) {
    console.error("parse error:", err);
    res.status(500).json({ error: err.message });
  }
}
