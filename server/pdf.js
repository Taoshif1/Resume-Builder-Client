import PDFDocument from "pdfkit";
import { fileURLToPath } from "node:url";
import { resumeDocument } from "../src/product/document.js";
import { resolvedDocumentStyle } from "../src/product/document-styles.js";

export function renderPdf(workspace, variantId) {
  const model = resumeDocument(workspace, variantId);
  const style = resolvedDocumentStyle(model);
  const lineGap = Math.max(-2, Math.min(9, (style.lineSpacing - 1.12) * model.fontSize));
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: model.paperSize,
      margins: {
        top: style.pageMargin,
        bottom: style.pageMargin,
        left: style.pageMargin,
        right: style.pageMargin,
      },
      bufferPages: true,
      info: {
        Title: `${model.name} ${model.documentType === "cv" ? "CV" : "Resume"}`,
        Author: model.name,
      },
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
    const left = style.pageMargin,
      width = pdf.page.width - style.pageMargin * 2;
    const bottom = () => pdf.page.height - style.pageMargin;
    const font = (size = model.fontSize, bold = false, color = "#172033") =>
      pdf
        .font(bold ? style.font.pdfBold : style.font.pdfRegular)
        .fontSize(size)
        .fillColor(color);
    const room = (height) => {
      if (pdf.y + height > bottom()) pdf.addPage();
    };
    const write = (
      text,
      {
        size = model.fontSize,
        bold = false,
        color = "#172033",
        ...options
      } = {},
    ) => {
      if (!text) return;
      font(size, bold, color).text(text, left, pdf.y, {
        width,
        lineGap,
        ...options,
      });
    };
    const measure = (text, available, size = model.fontSize, bold = false) =>
      font(size, bold).heightOfString(text || "", {
        width: available,
        lineGap,
      });
    const rule = (weight, color) => {
      const y = pdf.y;
      pdf
        .save()
        .strokeColor(color)
        .lineWidth(weight)
        .moveTo(left, y)
        .lineTo(left + width, y)
        .stroke()
        .restore();
    };
    // Each short label owns its clickable rectangle; wrap without ever measuring raw URLs.
    function linkRows(links, available) {
      font(9);
      const rows = [[]];
      let used = 0;
      for (const link of links) {
        const length = Math.min(available, pdf.widthOfString(link.label));
        if (used && used + 12 + length > available) {
          rows.push([]);
          used = 0;
        }
        rows.at(-1).push({ ...link, length });
        used += length + (used ? 12 : 0);
      }
      return rows;
    }
    function links(links, x, y, available, align = "right") {
      const rows = linkRows(links, available);
      for (const row of rows) {
        const rowWidth =
          row.reduce((n, link) => n + link.length, 0) +
          Math.max(0, row.length - 1) * 12;
        let dx =
          x +
          (align === "center"
            ? (available - rowWidth) / 2
            : align === "right"
              ? available - rowWidth
              : 0);
        let height = 0;
        for (const [index, link] of row.entries()) {
          if (index)
            font(9, false, style.accent).text("|", dx - 8, y, {
              lineBreak: false,
            });
          font(9, false, style.accent);
          const h = pdf.heightOfString(link.label, {
            width: link.length + 0.1,
            lineGap,
          });
          pdf.text(link.label, dx, y, {
            width: link.length + 0.1,
            lineGap,
            link: link.url,
          });
          height = Math.max(height, h);
          dx += link.length + 12;
        }
        y += height;
      }
      return y;
    }
    function rowMetrics(item) {
      const hasRight = item.dates || item.links?.length;
      const rightWidth = hasRight
        ? Math.min(
            width * 0.43,
            Math.max(
              105,
              font(9).widthOfString(item.dates || ""),
              ...(item.links || []).map(
                (l) => font(9).widthOfString(l.label) + 12,
              ),
            ),
          )
        : 0;
      const leftWidth = width - (hasRight ? rightWidth + 14 : 0);
      const titleHeight = measure(
        item.heading,
        leftWidth,
        model.fontSize,
        true,
      );
      const dateHeight = item.dates ? measure(item.dates, rightWidth, 9) : 0;
      const linkHeight = item.links?.length
        ? linkRows(item.links, rightWidth).reduce(
            (n, r) =>
              n +
              Math.max(...r.map((l) => measure(l.label, l.length + 0.1, 9))),
            0,
          )
        : 0;
      const height = Math.max(titleHeight, dateHeight + linkHeight);
      return { rightWidth, leftWidth, height };
    }
    function row(item) {
      const { rightWidth, leftWidth, height } = rowMetrics(item);
      // Unbounded user text may exceed a whole page: let PDFKit paginate it safely.
      if (height > bottom() - style.pageMargin - 25) {
        write(item.heading, { bold: true });
        if (item.dates) write(item.dates, { size: 9, align: "right" });
        for (const link of item.links || [])
          write(link.label, { size: 9, link: link.url, align: "right" });
        return;
      }
      room(height + Math.min(24, model.fontSize * 2));
      const y = pdf.y;
      font(model.fontSize, true).text(item.heading || "", left, y, {
        width: leftWidth,
        lineGap,
      });
      let rightY = y;
      if (item.links?.length)
        rightY = links(item.links, left + width - rightWidth, y, rightWidth);
      if (item.dates)
        font(9).text(item.dates, left + width - rightWidth, rightY, {
          width: rightWidth,
          align: "right",
          lineGap,
        });
      pdf.x = left;
      pdf.y = y + height;
    }
    write(model.name, {
      size: style.nameSize,
      bold: style.nameBold,
      align: style.align,
      color: style.accent,
    });
    write(model.title, { size: 12, align: style.align });
    write(model.contact, { size: 9, align: style.align });
    if (model.links.length) {
      pdf.y = links(model.links, left, pdf.y, width, style.align);
      pdf.x = left;
    }
    if (style.headerRule) {
      pdf.y += 6;
      rule(style.headerRule, style.accent);
    }
    for (const section of model.sections) {
      const first = section.items[0];
      const firstRow =
        first.heading || first.dates || first.links?.length
          ? rowMetrics(first).height
          : 0;
      room(
        Math.min(
          bottom() - style.pageMargin,
          style.sectionGap + 20 + firstRow + 24,
        ),
      );
      pdf.y += style.sectionGap;
      const sectionTitle = style.uppercase
        ? section.title.toUpperCase()
        : section.title;
      write(sectionTitle, {
        size: 10,
        bold: !["minimal", "academic"].includes(model.template),
        color: style.accent,
      });
      if (style.sectionStyle === "line") {
        rule(style.rule, style.accent);
        pdf.y += 4;
      } else if (style.sectionStyle === "underline") {
        const y = pdf.y;
        const underlineWidth = Math.min(
          width,
          font(10, false, style.accent).widthOfString(sectionTitle) + 18,
        );
        pdf
          .save()
          .strokeColor(style.accent)
          .lineWidth(Math.max(0.45, style.rule || 0.45))
          .moveTo(left, y)
          .lineTo(left + underlineWidth, y)
          .stroke()
          .restore();
        pdf.y += 4;
      } else {
        pdf.y += 2;
      }
      for (const item of section.items) {
        if (item.heading || item.dates || item.links?.length) row(item);
        if (item.subheading)
          write(item.subheading, { bold: model.template === "corporate" });
        if (section.key === "projects" && item.bullets?.length) {
          room(30);
          write("Features:", { size: model.fontSize - 1, bold: true });
        }
        write(item.text);
        for (const bullet of item.bullets || []) {
          room(model.fontSize * 2);
          const y = pdf.y;
          font().text("\u2022", left + 2, y, { lineBreak: false });
          font().text(bullet, left + 12, y, {
            width: width - 12,
            lineGap,
          });
          pdf.x = left;
        }
        if (item.tech)
          write(`Tech: ${item.tech}`, { size: model.fontSize - 1 });
        pdf.y += style.entryGap;
      }
    }
    pdf.end();
  });
}
