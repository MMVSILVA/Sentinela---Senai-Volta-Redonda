import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "" // Redirect URI will be set per request
);

// API Routes
app.get("/api/auth/google/url", (req, res) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const origin = `${protocol}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;
  
  const uid = req.query.uid as string;
  
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email"
    ],
    prompt: "consent",
    state: uid,
    redirect_uri: redirectUri
  });
  
  res.json({ url });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;
  const uid = req.query.state as string;
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const origin = `${protocol}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri
    });
    
    // In a real production app, we'd save tokens to Firestore here using admin SDK
    // For this context, we'll send them back via postMessage to the client to save.
    // NOTE: This sends sensitive data to the browser, but is necessary for client-side firestore usage without Admin SDK setup.

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'GOOGLE_OAUTH_SUCCESS', 
                tokens: ${JSON.stringify(tokens)},
                uid: "${uid}"
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticação concluída! Esta janela fechará automaticamente.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).send("Erro na autenticação.");
  }
});

app.post("/api/calendar/sync", async (req, res) => {
  const { tokens } = req.body;
  if (!tokens) return res.status(401).send("Tokens missing");

  try {
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.json(response.data.items);
  } catch (error) {
    console.error("Calendar sync error:", error);
    res.status(500).json({ error: "Failed to sync calendar" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
