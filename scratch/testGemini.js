const fs = require('fs');
const path = require('path');

// Basic env parser for .env.local
try {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
} catch (e) {
  console.log("No .env.local found or error reading it:", e.message);
}

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", key ? `FOUND (starts with ${key.substring(0, 5)}... length ${key.length})` : "MISSING");
    
    const models = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
      "gemini-2.0-flash-exp"
    ];
    for (const model of models) {
      try {
        console.log(`Testing model: ${model}...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: "I drove 150 kilometers today in a large diesel SUV",
        });
        console.log(`SUCCESS with ${model}! Response:`, response.text);
        break;
      } catch (err) {
        console.error(`FAILED with ${model}:`, err.message);
      }
    }
  } catch (error) {
    console.error("ERROR OCCURRED:", error);
  }
}

run();
