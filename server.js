const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'projects.json');
const readData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

app.get('/', (req, res) => {
  const { project, images, panels } = readData();
  res.render('index', { project, images, panels });
});

app.listen(PORT, () => console.log(`✨ http://localhost:${PORT}`));
