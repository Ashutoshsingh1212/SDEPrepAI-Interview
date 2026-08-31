import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export const uploadResume = async (req,res) => {
  let parser;
  try {
    if (!req.file) return res.status(400).json({success:false,message:"No PDF uploaded"});
    if (req.file.mimetype !== "application/pdf") return res.status(400).json({success:false,message:"Only PDF files are supported"});
    const buffer = await fs.readFile(req.file.path);
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    res.json({success:true,filename:req.file.filename,text:result.text || ""});
  } catch (err) {
    console.error("PDF parsing error:",err);
    res.status(500).json({success:false,message:"PDF parsing failed",details:err.message});
  } finally {
    try { await parser?.destroy(); } catch {}
  }
};
