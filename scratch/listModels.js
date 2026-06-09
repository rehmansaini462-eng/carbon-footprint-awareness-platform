const fs = require('fs');
const path = require('path');

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
  // Ignored
}

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    console.log("Listing available models...");
    const list = await ai.models.list();
    if (list && list.models) {
      list.models.forEach(m => {
        console.log(`- Name: ${m.name}, DisplayName: ${m.displayName}, Methods: ${m.supportedGenerationMethods.join(', ')}`);
      });
    } else {
      console.log("Empty list received.");
    }
  } catch (error) {
    console.error("ERROR LISTING MODELS:", error);
  }
}

run();
