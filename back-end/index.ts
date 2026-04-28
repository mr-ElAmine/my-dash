import express from "express";
import cors from "cors";
import { PdfController } from "./controllers/pdf";

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const pdfController = new PdfController();

app.get("/generate-quote/:id", (req, res) =>
  pdfController.generateQuote(req, res),
);

app.get("/generate-invoice/:id", (req, res) =>
  pdfController.generateInvoice(req, res),
);

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
