import express from "express";
import cors from "cors";
import { PdfController } from "./controllers/pdf";
import { QuoteController } from "./controllers/quote";
import { InvoiceController } from "./controllers/invoice";

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const pdfController = new PdfController();
const quoteController = new QuoteController();
const invoiceController = new InvoiceController();

// ── Quotes ──

app.get("/quotes", (req, res) => quoteController.list(req, res));
app.get("/quotes/:id", (req, res) => quoteController.get(req, res));
app.post("/quotes", (req, res) => quoteController.create(req, res));
app.patch("/quotes/:id/send", (req, res) => quoteController.send(req, res));
app.patch("/quotes/:id/accept", (req, res) => quoteController.accept(req, res));
app.patch("/quotes/:id/refuse", (req, res) => quoteController.refuse(req, res));
app.patch("/quotes/:id/cancel", (req, res) => quoteController.cancel(req, res));

// ── Invoices ──

app.get("/invoices", (req, res) => invoiceController.list(req, res));
app.get("/invoices/:id", (req, res) => invoiceController.get(req, res));
app.patch("/invoices/:id/send", (req, res) => invoiceController.send(req, res));
app.patch("/invoices/:id/pay", (req, res) => invoiceController.pay(req, res));
app.patch("/invoices/:id/cancel", (req, res) =>
  invoiceController.cancel(req, res),
);
app.patch("/invoices/:id/mark-overdue", (req, res) =>
  invoiceController.markOverdue(req, res),
);

// ── PDF ──

app.get("/quotes/:id/pdf", (req, res) => pdfController.generateQuote(req, res));
app.get("/invoices/:id/pdf", (req, res) =>
  pdfController.generateInvoice(req, res),
);

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
