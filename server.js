const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const ready = app.prepare();

ready
  .then(() => {
    console.log("Next.js is ready");
  })
  .catch((error) => {
    console.error("Next.js startup failed", error);
  });

const server = express();

server.all(/.*/, (req, res) => {
  ready.then(() => handle(req, res)).catch(() => {
    res.status(503).send("The application is still starting. Please refresh shortly.");
  });
});

server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
