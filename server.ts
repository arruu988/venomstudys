import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCmJAVblRsmjeDbJuSklUUn4NSDHp851LI",
  authDomain: "website-f1792.firebaseapp.com",
  projectId: "website-f1792",
  storageBucket: "website-f1792.firebasestorage.app",
  messagingSenderId: "833090181424",
  appId: "1:833090181424:web:3d49fe6f501665494410f5"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Authenticate server
  try {
    await signInWithEmailAndPassword(auth, "nottmeeeeeeeee@gmail.com", "admin123");
    console.log("Server authenticated with Firebase");
  } catch (error) {
    console.error("Failed to authenticate server:", error);
  }

  app.use(express.json());

  // Proxy for OpenRouter API to hide the API key
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      const apiKey = process.env.OPENROUTER_API_KEY || "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"; // Fallback to provided key
      
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openrouter/free', // Using auto free model
          messages: [
            {
              role: 'system',
              content: 'You are "NEET AI", an expert AI tutor specializing in NEET exam preparation. Your goal is to help students solve physics, chemistry, and biology doubts accurately and concisely.'
            },
            ...messages
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'https://vnm-study.app',
            'X-Title': 'NEET Breakers Archive'
          }
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("OpenRouter API Error:", error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to process chat request' });
    }
  });

  // Proxy for Google Drive PDF fetching to bypass CORS
  app.get('/api/pdf', async (req, res) => {
    const driveUrl = req.query.url as string;
    
    if (!driveUrl) {
      return res.status(400).send('Missing Drive URL');
    }

    try {
      // Extract File ID from standard Drive link (e.g., https://drive.google.com/file/d/16J7xuFAxNXk3KAFU1rmr2OVcsDpNI2cE/view?usp=drivesdk)
      const match = driveUrl.match(new RegExp('/d/([a-zA-Z0-9_-]+)'));
      const fileId = match ? match[1] : driveUrl; // Fallback to treating it as ID directly

      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
      
      const response = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'stream',
      });

      res.setHeader('Content-Type', 'application/pdf');
      // allow cross-origin
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      response.data.pipe(res);
    } catch (error: any) {
      console.error("PDF Proxy Error:", error.message);
      res.status(500).send('Error fetching PDF');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
