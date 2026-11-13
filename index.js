const express = require('express');
const path = require('path');
const { menu } = require('./db.json');

if (!Array.isArray(menu)) {
   throw new Error('db.json debe contener un arreglo "menu".');
}

const app = express();
const port = Number(process.env.PORT) || 4000;

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/menu', (req, res) => {
   res.json(menu);
});

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.listen(port, () => {
   console.log(`Servidor listo en http://localhost:${port}`);
});
