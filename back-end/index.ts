import express from 'express';
import { PdfController } from './controllers/pdf';

const app = express();
const port = 3000;
const pdfController = new PdfController();

// Utilisation du contrôleur pour la route PDF
app.get('/generate-pdf', (req, res) => pdfController.downloadBasicInvoice(req, res));

app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
