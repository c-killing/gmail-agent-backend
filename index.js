const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("✅ Gmail Agent Backend Running");
});

app.post("/send-email", async (req, res) => {
  try {
    const { to, subject, body, access_token } = req.body;

    const mime = [
      `To: ${to}`,
      "Content-Type: text/plain; charset=utf-8",
      `Subject: ${subject}`,
      "",
      body
    ].join("\r\n");

    const raw = Buffer.from(mime, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const resp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw })
    });

    const data = await resp.json();
    res.status(resp.ok ? 200 : resp.status).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
