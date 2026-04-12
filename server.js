const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// config view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static files
app.use(express.static(path.join(__dirname, "public")));

// --- LOAD DATA ---
function readData() {
  const dataPath = path.join(__dirname, "data", "projects.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

// --- LOAD LOCALE ---
function getLocale(lang) {
  try {
    const filePath = path.join(__dirname, "locales", `${lang}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    const fallbackPath = path.join(__dirname, "locales", "fr.json");
    const raw = fs.readFileSync(fallbackPath, "utf-8");
    return JSON.parse(raw);
  }
}

// --- ROUTE ---
app.get("/:lang?", (req, res) => {
  const lang = req.params.lang === "en" ? "en" : "fr";

  const data = readData();
  const t = getLocale(lang);

  res.render("index", {
    ...data,
    t,
    lang
  });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});