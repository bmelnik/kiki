const express = require("express");
const next = require("next");
const puppeteer = require("puppeteer");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function buildMenuPrintUrl(req) {
  if (process.env.PDF_MENU_URL) {
    return process.env.PDF_MENU_URL;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = typeof forwardedProto === "string" ? forwardedProto.split(",")[0] : "http";
  const host = req.get("host");

  return `${proto}://${host}/menu-print`;
}

async function renderMenuPdf(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 90000,
    });

    await page.emulateMediaType("print");
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        right: "10mm",
        bottom: "12mm",
        left: "10mm",
      },
    });
  } finally {
    await browser.close();
  }
}

app
  .prepare()
  .then(() => {
    const server = express();

    server.get("/menu-pdf", async (req, res) => {
      try {
        const menuPrintUrl = buildMenuPrintUrl(req);
        const pdfBuffer = await renderMenuPdf(menuPrintUrl);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="kiki-menu.pdf"');
        res.setHeader("Cache-Control", "public, max-age=300");
        res.send(pdfBuffer);
      } catch (error) {
        console.error("Failed to generate menu PDF", error);
        res.status(500).json({
          error: "Failed to generate menu PDF",
        });
      }
    });

    server.all(/.*/, (req, res) => handle(req, res));

    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed", error);
    process.exit(1);
  });
