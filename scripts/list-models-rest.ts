import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function check() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log(data.models.map((m: any) => m.name));
  } catch (err) {
    console.error(err);
  }
}
check();
