const express = require('express');
const path = require('path');
const menuRoutes = require('./src/routes/menuRoutes');

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/', menuRoutes);

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'src', 'views', 'index.html'));
});

app.listen(port, () => {
   console.log(`Servidor listo en http://localhost:${port}`);
});
