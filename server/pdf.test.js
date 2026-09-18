import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createApp } from "./app.js";
import { documentFixture } from "./fixtures/document.js";

for (const template of ["modern", "minimal", "corporate"]) {
  test(`${template}: authenticated PDF export matrix, selectable text, safe links and page bounds`, async (t) => {
    let workspace;
    const server = createApp({
      auth: { verifyIdToken: async () => ({ uid: "fixture-user" }) },
      service: {
        account: async () => ({ role: "owner", plan: "pro", status: "active" }),
        load: async () => ({ workspace }),
        recordExport: async () => {},
      },
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    t.after(() => server.close());
    for (const documentType of ["resume", "cv"])
      for (const paperSize of ["A4", "LETTER"])
        for (const fontSize of [10, 11, 12]) {
          workspace = documentFixture({
            template,
            documentType,
            paperSize,
            fontSize,
            long: documentType === "cv",
          });
          const response = await fetch(
            `http://127.0.0.1:${server.address().port}/api/export`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer fixture",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                variantId: workspace.resumeVariants[0].id,
              }),
            },
          );
          assert.equal(response.status, 200);
          assert.equal(response.headers.get("content-type"), "application/pdf");
          if (documentType === "cv")
            assert.match(
              response.headers.get("content-disposition"),
              /-CV\.pdf/,
            );
          const bytes = new Uint8Array(await response.arrayBuffer());
          assert.ok(bytes.length > 1000);
          const loading = getDocument({ data: bytes, useSystemFonts: true });
          const pdf = await loading.promise;
          if (documentType === "cv") assert.ok(pdf.numPages > 2);
          else assert.ok(pdf.numPages <= 2);
          let text = "",
            annotations = [];
          for (let n = 1; n <= pdf.numPages; n++) {
            const page = await pdf.getPage(n);
            const content = await page.getTextContent();
            annotations.push(...(await page.getAnnotations()));
            for (const item of content.items)
              if (item.str.trim()) {
                text += item.str + " ";
                const x = item.transform[4],
                  y = item.transform[5];
                assert.ok(
                  x >= 40 && x + item.width <= page.view[2] - 35,
                  `${template} ${fontSize} horizontal bounds: ${item.str}`,
                );
                assert.ok(
                  y >= 35 && y <= page.view[3] - 35,
                  `${template} vertical bounds: ${item.str}`,
                );
              }
            const dates = content.items.filter((i) =>
              i.str.includes("January 2025"),
            );
            for (const date of dates)
              assert.ok(
                date.transform[4] > page.view[2] / 2,
                "dates sit in right column",
              );
          }
          assert.ok(text.includes("Alex Morgan"));
          assert.ok(text.includes("Tech:"));
          assert.ok(text.includes("Features:"));
          assert.ok(text.includes("Bangla: Native | English: Professional"));
          assert.ok(
            annotations.some(
              (a) => a.url === "https://github.com/example/project-0",
            ),
          );
          assert.ok(!text.includes("deep/deep"), "raw URLs are not printed");
          if (documentType === "cv")
            assert.ok(
              text.includes("Community Platform 17"),
              "all long CV entries survive",
            );
          await loading.destroy();
        }
  });
}


test("Document Studio exports custom typography, spacing, color and new template formats", async (t) => {
  let workspace;
  const server = createApp({
    auth: { verifyIdToken: async () => ({ uid: "fixture-user" }) },
    service: {
      account: async () => ({ role: "owner", plan: "pro", status: "active" }),
      load: async () => ({ workspace }),
      recordExport: async () => {},
    },
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());

  for (const template of ["compact", "classic", "academic"]) {
    workspace = documentFixture({
      template,
      documentType: template === "academic" ? "cv" : "resume",
      paperSize: template === "academic" ? "LEGAL" : "A4",
      fontSize: 9.5,
      long: false,
      design: {
        fontFamily: template === "compact" ? "mono" : "serif",
        lineSpacing: 1.3,
        sectionGap: 5,
        entryGap: 2,
        pageMargin: 36,
        accentColor: "#7a3344",
        headerAlign: "left",
        sectionStyle: template === "academic" ? "underline" : "plain",
      },
    });
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/export`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer fixture",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: workspace.resumeVariants[0].id,
        }),
      },
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/pdf");
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.ok(bytes.length > 1000);
    const loading = getDocument({ data: bytes, useSystemFonts: true });
    const pdf = await loading.promise;
    assert.ok(pdf.numPages >= 1);
    const firstPage = await pdf.getPage(1);
    const content = await firstPage.getTextContent();
    assert.ok(content.items.some((item) => item.str.includes("Alex Morgan")));
    for (const item of content.items)
      if (item.str.trim()) {
        assert.ok(item.transform[4] >= 25, `${template}: left margin respected`);
        assert.ok(
          item.transform[4] + item.width <= firstPage.view[2] - 25,
          `${template}: right margin respected for ${item.str}`,
        );
      }
    await loading.destroy();
  }
});
