import { Request, Response } from 'express';
import { PdfService } from '../services/pdfService';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfService = new PdfService();

export class PdfController {
  /**
   * Endpoint pour générer et télécharger la facture basique
   */
  async downloadBasicInvoice(req: Request, res: Response) {
    try {
      // On définit un chemin temporaire pour le PDF (à la racine du back-end pour cet exemple)
      const fileName = `facture_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../', fileName);

      await pdfService.generateBasicInvoice(filePath);

      // Envoyer le fichier au client
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Erreur lors de l\'envoi du fichier:', err);
          if (!res.headersSent) {
            res.status(500).send('Erreur lors du téléchargement');
          }
        }
        
        // Supprimer le fichier local après l'envoi
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Erreur Controller PDF:', error);
      res.status(500).send('Erreur lors de la génération du PDF');
    }
  }
}
