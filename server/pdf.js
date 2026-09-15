import PDFDocument from "pdfkit";
import { fileURLToPath } from "node:url";
import { resumeDocument } from "../src/product/document.js";

export function renderPdf(workspace, variantId) {
  const model = resumeDocument(workspace, variantId);
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: model.paperSize,
      margins: { top: 44, bottom: 44, left: 44, right: 44 },
      bufferPages: true,
      info: { Title: `${model.name} Resume`, Author: model.name },
    });
    pdf.registerFont(
      "Regular",
      fileURLToPath(
        new URL("../public/fonts/NotoSans-Regular.ttf", import.meta.url),
      ),
    );
    pdf.registerFont(
      "Bold",
      fileURLToPath(
        new URL("../public/fonts/NotoSans-Bold.ttf", import.meta.url),
      ),
    );
    const chunks = [];
    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("error", reject);
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    const write = (text, size = model.fontSize, bold = false, options = {}) => {
      if (!text) return;
      pdf
        .font(bold ? "Bold" : "Regular")
        .fontSize(size)
        .fillColor("#172033")
        .text(text, { lineGap: 3, ...options });
    };
    write(model.name, 23, true);
    write(model.title, 13);
    write(model.contact, 10);
    for (const link of model.links)
      write(`${link.label}: ${link.url}`, 10, false, { link: link.url });
    for (const section of model.sections) {
      if (pdf.y > pdf.page.height - 120) pdf.addPage();
      pdf.moveDown(0.7);
      write(section.title.toUpperCase(), 11, true);
      for (const item of section.items) {
        if (pdf.y > pdf.page.height - 100) pdf.addPage();
        write(item.heading, model.fontSize, true);
        write(item.dates, 10);
        write(item.text);
        if (item.url) write(item.url, 10, false, { link: item.url });
        pdf.moveDown(0.4);
      }
    }
    pdf.end();
  });
}
