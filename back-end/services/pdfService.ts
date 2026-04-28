import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class PdfService {
  /**
   * Génère une facture basique avec des données en dur
   * @param outputPath Chemin où enregistrer le PDF
   */
  async generateBasicInvoice(outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // On spécifie explicitement le format 'A4'
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50 
      });

      // Données en dur
      const invoiceData = {
        number: 'FAC-2024-001',
        date: new Date().toLocaleDateString('fr-FR'),
        company: {
          name: 'Ma Super Entreprise',
          address: '123 Rue de l\'Innovation, 75001 Paris',
          email: 'contact@entreprise.fr'
        },
        client: {
          name: 'Jean Dupont',
          address: '45 Avenue des Champs-Élysées, 75008 Paris'
        },
        items: [
          { description: 'Consulting Dev', quantity: 2, price: 500 },
          { description: 'Design Logo', quantity: 1, price: 300 },
          { description: 'Maintenance', quantity: 5, price: 50 }
        ],
        taxRate: 0.20
      };

      // Configuration du flux de sortie
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // --- EN-TÊTE ---
      doc.fontSize(20).text('FACTURE', { align: 'right' });
      doc.fontSize(10).text(`N° ${invoiceData.number}`, { align: 'right' });
      doc.text(`Date : ${invoiceData.date}`, { align: 'right' });
      doc.moveDown();

      // Info Entreprise
      doc.fontSize(12).font('Helvetica-Bold').text(invoiceData.company.name);
      doc.fontSize(10).font('Helvetica').text(invoiceData.company.address);
      doc.text(invoiceData.company.email);
      doc.moveDown(2);

      // Info Client
      doc.font('Helvetica-Bold').text('Destinataire :', { underline: true });
      doc.font('Helvetica').text(invoiceData.client.name);
      doc.text(invoiceData.client.address);
      doc.moveDown(2);

      // --- TABLEAU DES ARTICLES ---
      const tableTop = 250;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Qté', 300, tableTop, { width: 50, align: 'right' });
      doc.text('Prix Unitaire', 370, tableTop, { width: 80, align: 'right' });
      doc.text('Total HT', 470, tableTop, { width: 70, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.font('Helvetica');

      let currentHeight = tableTop + 25;
      let totalHT = 0;

      invoiceData.items.forEach(item => {
        const itemTotal = item.quantity * item.price;
        totalHT += itemTotal;

        doc.text(item.description, 50, currentHeight);
        doc.text(item.quantity.toString(), 300, currentHeight, { width: 50, align: 'right' });
        doc.text(`${item.price} €`, 370, currentHeight, { width: 80, align: 'right' });
        doc.text(`${itemTotal} €`, 470, currentHeight, { width: 70, align: 'right' });

        currentHeight += 20;
      });

      // --- TOTAUX ---
      const tva = totalHT * invoiceData.taxRate;
      const totalTTC = totalHT + tva;

      doc.moveTo(350, currentHeight + 10).lineTo(550, currentHeight + 10).stroke();
      
      currentHeight += 20;
      doc.text('Total HT :', 350, currentHeight);
      doc.text(`${totalHT.toFixed(2)} €`, 470, currentHeight, { width: 70, align: 'right' });

      currentHeight += 20;
      doc.text('TVA (20%) :', 350, currentHeight);
      doc.text(`${tva.toFixed(2)} €`, 470, currentHeight, { width: 70, align: 'right' });

      currentHeight += 25;
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('TOTAL TTC :', 350, currentHeight);
      doc.text(`${totalTTC.toFixed(2)} €`, 470, currentHeight, { width: 70, align: 'right' });

      // --- PIED DE PAGE ---
      doc.fontSize(8).font('Helvetica').text(
        'Merci de votre confiance. Paiement dû sous 30 jours.',
        50,
        700,
        { align: 'center', width: 500 }
      );

      // Finalisation
      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', (err) => reject(err));
    });
  }
}
