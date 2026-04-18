import fs from "fs";
import axios from "axios";
import readlineSync from "readline-sync";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;

// 🧠 CHAT HISTORY
let history = [
  {
    role: "system",
    content: `
You are a coding assistant.

Return ONLY JSON in this format:

{
  "folder": "project-name",
  "files": {
    "index.html": "FULL HTML CODE",
    "styles.css": "FULL CSS CODE",
    "script.js": "FULL JS CODE"
  }
}

Rules:
- Create or modify project
- Always return full updated code
- No explanation
`
  }
];

// 🤖 AI CALL
async function askAI(prompt) {
  // add user input to history
  history.push({
    role: "user",
    content: prompt
  });

  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini",
      messages: history
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    }
  );

  const reply = res.data.choices[0].message.content;

  // add AI response to history
  history.push({
    role: "assistant",
    content: reply
  });

  return reply;
}

// 🛠 CREATE / UPDATE FILES
function createProject(data) {
  // ⚠️ JSON safe extract
  const jsonMatch = data.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.log("❌ Invalid JSON from AI");
    return;
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const folder = parsed.folder;

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  for (let file in parsed.files) {
    fs.writeFileSync(
      `${folder}/${file}`,
      parsed.files[file]
    );
  }

  console.log("\n✅ Project Updated!");
}

// 🔁 LOOP
while (true) {
  const input = readlineSync.question("\n⚡ AI Dev > ");

  if (input.toLowerCase() === "exit") break;

  if (input.toLowerCase() === "reset") {
    console.log("🔄 Memory Cleared");
    history = [history[0]]; // keep system prompt
    continue;
  }

  try {
    const response = await askAI(input);

    console.log("\n🤖 AI Response received");

    createProject(response);
  } catch (err) {
    console.log("❌ Error:", err.message);
  }
}