import fs from "fs";
import axios from "axios";
import readlineSync from "readline-sync";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;

// 🔥 AI CALL
async function askAI(prompt) {
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are an expert full-stack developer.

Return ONLY valid JSON in this format:

{
  "folder": "project-name",
  "files": {
    "index.html": "...",
    "styles.css": "...",
    "script.js": "..."
  }
}

Rules:
- Only JSON
- No explanation
- Full working code
`
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.choices[0].message.content;

  } catch (err) {
    console.log("❌ API Error:", err.response?.data || err.message);
    return null;
  }
}

// 📁 CREATE PROJECT
function createProject(response) {
  try {
    const parsed = JSON.parse(response);

    const folder = parsed.folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    for (let file in parsed.files) {
      fs.writeFileSync(`${folder}/${file}`, parsed.files[file]);
    }

    console.log(`\n✅ Project "${folder}" created successfully!\n`);

  } catch (err) {
    console.log("❌ JSON Parse Error:", err.message);
  }
}

// 🚀 MAIN LOOP
async function main() {
  while (true) {
    const input = readlineSync.question("🤖 AI Dev > ");

    if (input.toLowerCase() === "exit") break;

    const response = await askAI(input);

    if (response) {
      createProject(response);
    }
  }
}

main();