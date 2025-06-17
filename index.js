const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/obtener-imagen', async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) return res.status(400).json({ error: 'Usuario requerido' });

  try {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://www.banplusonline.com/SIBEL/ClienteNatural/Login.aspx', { waitUntil: 'networkidle2' });

  await page.type('#ctl00_ContenedorPrincipal_tIdentificador', usuario);
  await page.click('#bAceptarIdentificadorUsuarioLinkButton');

  await page.waitForTimeout(4000); // Esperamos 4 segundos

  const imgSrc = await page.$eval('#ctl00_ContenedorPrincipal_imImagen', img => img.src);

  await browser.close();

  // Detectar imagen por defecto
  if (imgSrc.includes('logobanplusclaro.png')) {
    return res.status(404).json({ error: 'Usuario no válido o imagen no generada.' });
  }

  res.json({ imagen: imgSrc });

} catch (err) {
  console.error('Error en scraping:', err.message);
  res.status(500).json({ error: 'No se pudo obtener la imagen.' });
}

});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});

