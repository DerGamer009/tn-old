// @ts-ignore - pdfkit wird nach Installation verfügbar sein
import PDFDocument from 'pdfkit';
import type { Invoice, User, Order, Server } from '@prisma/client';

interface InvoiceData extends Invoice {
	user: User;
	order?: Order & {
		servers?: Server[];
	};
}

// Firmeninformationen
const COMPANY_INFO = {
	name: 'TitanNode',
	address: 'Karl-Liebknecht-Ring 2',
	city: '06679 Hohenmölsen',
	country: 'Deutschland',
	email: 'support@titannode.org',
	website: 'https://titannode.org',
	taxId: 'DE123456789' // Umsatzsteuer-ID
};

// Farben
const COLORS = {
	primary: '#3b82f6', // Blau
	primaryDark: '#2563eb',
	secondary: '#10b981', // Grün
	text: '#1f2937', // Dunkelgrau
	textLight: '#6b7280', // Hellgrau
	background: '#f9fafb', // Sehr helles Grau
	border: '#e5e7eb', // Grauer Rahmen
	success: '#10b981', // Grün für bezahlt
	warning: '#f59e0b', // Orange für offen
	danger: '#ef4444' // Rot für überfällig
};

export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			// @ts-ignore - PDFDocument kann als default export oder named export kommen
			const PDFDoc = (PDFDocument as any).default || PDFDocument;
			const doc = new PDFDoc({ 
				margin: 50, 
				size: 'A4',
				info: {
					Title: `Rechnung ${invoice.invoiceNumber}`,
					Author: COMPANY_INFO.name,
					Subject: 'Rechnung'
				}
			});
			const buffers: Buffer[] = [];

			doc.on('data', buffers.push.bind(buffers));
			doc.on('end', () => {
				const pdfBuffer = Buffer.concat(buffers);
				resolve(pdfBuffer);
			});
			doc.on('error', reject);

			// ========== HEADER ==========
			// Farbiger Header-Bereich (kleiner gemacht)
			doc.rect(50, 50, 500, 50)
			   .fill(COLORS.primary);
			
			// Firmenname (kleiner, fett, weiß auf blauem Hintergrund)
			doc.fontSize(24)
			   .font('Helvetica-Bold')
			   .fillColor('#ffffff')
			   .text(COMPANY_INFO.name, 60, 58);
			
			// "Rechnung" Label (weiß, kleiner)
			doc.fontSize(14)
			   .font('Helvetica-Bold')
			   .fillColor('#ffffff')
			   .text('RECHNUNG', 60, 82);
			
			// Zurück zu schwarzer Farbe für den Rest
			doc.fillColor('#000000');

			// Rechte Seite: Rechnungsinformationen (weiß auf blauem Hintergrund)
			const rightX = 350;
			let rightY = 58;
			
			doc.fontSize(8)
			   .font('Helvetica')
			   .fillColor('#ffffff')
			   .text('Rechnungsnummer:', rightX, rightY, { width: 200, align: 'right' });
			doc.font('Helvetica-Bold')
			   .fontSize(9)
			   .text(invoice.invoiceNumber, rightX, rightY + 10, { width: 200, align: 'right' });
			
			rightY += 20;
			doc.font('Helvetica')
			   .fontSize(8)
			   .text('Rechnungsdatum:', rightX, rightY, { width: 200, align: 'right' });
			doc.font('Helvetica-Bold')
			   .fontSize(9)
			   .text(new Date(invoice.createdAt).toLocaleDateString('de-DE', {
				   day: '2-digit',
				   month: '2-digit',
				   year: 'numeric'
			   }), rightX, rightY + 10, { width: 200, align: 'right' });
			
			rightY += 20;
			doc.font('Helvetica')
			   .fontSize(8)
			   .text('Fälligkeitsdatum:', rightX, rightY, { width: 200, align: 'right' });
			doc.font('Helvetica-Bold')
			   .fontSize(9)
			   .text(new Date(invoice.dueDate).toLocaleDateString('de-DE', {
				   day: '2-digit',
				   month: '2-digit',
				   year: 'numeric'
			   }), rightX, rightY + 10, { width: 200, align: 'right' });
			
			// Zurück zu schwarzer Farbe
			doc.fillColor('#000000');

			// ========== FIRMENINFORMATIONEN ==========
			let currentY = 115;
			doc.fontSize(8)
			   .font('Helvetica')
			   .fillColor(COLORS.text)
			   .text(COMPANY_INFO.address, 50, currentY);
			currentY += 10;
			doc.text(`${COMPANY_INFO.city}, ${COMPANY_INFO.country}`, 50, currentY);
			currentY += 10;
			doc.fillColor(COLORS.primary)
			   .text(`E-Mail: ${COMPANY_INFO.email}`, 50, currentY);
			currentY += 10;
			doc.text(`Web: ${COMPANY_INFO.website}`, 50, currentY);
			currentY += 10;
			doc.fillColor(COLORS.text)
			   .text(`USt-IdNr.: ${COMPANY_INFO.taxId}`, 50, currentY);

			// ========== RECHNUNGSEMPFÄNGER ==========
			currentY += 20;
			doc.fontSize(10)
			   .font('Helvetica-Bold')
			   .text('Rechnungsempfänger:', 50, currentY);
			currentY += 14;
			doc.fontSize(9)
			   .font('Helvetica')
			   .text(`${invoice.user.firstName} ${invoice.user.lastName}`, 50, currentY);
			currentY += 12;
			doc.text(invoice.user.email, 50, currentY);

			// ========== RECHNUNGSPOSITIONEN ==========
			currentY += 20;
			
			// Tabellen-Header mit farbigem Hintergrund
			const tableStartY = currentY;
			doc.rect(50, tableStartY, 500, 20)
			   .fill(COLORS.primaryDark)
			   .stroke(COLORS.primaryDark);
			
			doc.fontSize(9)
			   .font('Helvetica-Bold')
			   .fillColor('#ffffff')
			   .text('Beschreibung', 55, tableStartY + 6);
			doc.text('Betrag', 480, tableStartY + 6, { align: 'right', width: 65 });
			
			// Zurück zu schwarzer Farbe
			doc.fillColor('#000000');
			
			currentY = tableStartY + 20;

			// Berechne Gesamtsumme aus Server-Preisen
			let totalAmount = 0;
			const items: Array<{ description: string; amount: number }> = [];

			if (invoice.order?.servers && invoice.order.servers.length > 0) {
				for (const server of invoice.order.servers) {
					const serverAmount = server.priceMonthly;
					totalAmount += serverAmount;
					items.push({
						description: `${server.name} (${server.type})`,
						amount: serverAmount
					});
				}
			} else {
				// Fallback: Verwende Invoice-Betrag direkt
				totalAmount = invoice.amount;
				items.push({
					description: 'Service',
					amount: invoice.amount
				});
			}

			// Stelle sicher, dass totalAmount mit invoice.amount übereinstimmt
			// (invoice.amount ist die autoritative Quelle)
			totalAmount = invoice.amount;

			// Rechnungspositionen
			let rowIndex = 0;
			for (const item of items) {
				// Abwechselnde Zeilen-Hintergründe (kompakter)
				if (rowIndex % 2 === 0) {
					doc.rect(50, currentY, 500, 20)
					   .fill(COLORS.background)
					   .stroke(COLORS.border);
				} else {
					doc.rect(50, currentY, 500, 20)
					   .fill('#ffffff')
					   .stroke(COLORS.border);
				}
				
				doc.fontSize(9)
				   .font('Helvetica')
				   .fillColor(COLORS.text)
				   .text(item.description, 55, currentY + 5, { width: 420 });
				
				// Betrag rechtsbündig
				const itemAmount = items.length === 1 ? totalAmount : item.amount;
				doc.font('Helvetica-Bold')
				   .fillColor(COLORS.text)
				   .text(`€${itemAmount.toFixed(2).replace('.', ',')}`, 480, currentY + 5, { 
					   align: 'right', 
					   width: 65 
				   });
				
				currentY += 20;
				rowIndex++;
			}

			// Untere Linie der Tabelle (dicker, farbig)
			doc.moveTo(50, currentY)
			   .lineTo(550, currentY)
			   .lineWidth(2)
			   .strokeColor(COLORS.primary)
			   .stroke();
			currentY += 10;

			// Gesamtbetrag (hervorgehoben mit Hintergrund, kleiner)
			doc.rect(350, currentY - 2, 200, 22)
			   .fill(COLORS.primary)
			   .stroke(COLORS.primary);
			
			doc.fontSize(10)
			   .font('Helvetica-Bold')
			   .fillColor('#ffffff')
			   .text('Gesamtbetrag:', 360, currentY + 2);
			doc.fontSize(12)
			   .text(`€${totalAmount.toFixed(2).replace('.', ',')}`, 480, currentY, { 
				   align: 'right', 
				   width: 65 
			   });
			
			// Zurück zu schwarzer Farbe
			doc.fillColor('#000000')
			   .lineWidth(1)
			   .strokeColor('#000000');

			// ========== STATUS & ZAHLUNGSINFORMATIONEN ==========
			currentY += 20;
			
			const statusText = invoice.status === 'PAID' ? 'Bezahlt' : 
							   invoice.status === 'OVERDUE' ? 'Überfällig' : 
							   invoice.status === 'CANCELLED' ? 'Storniert' : 'Offen';
			
			const statusColor = invoice.status === 'PAID' ? COLORS.success :
								invoice.status === 'OVERDUE' ? COLORS.danger :
								invoice.status === 'CANCELLED' ? COLORS.textLight :
								COLORS.warning;
			
			// Status-Badge mit Hintergrund (kleiner)
			doc.rect(50, currentY - 3, 180, 26)
			   .fill(statusColor)
			   .stroke(statusColor);
			
			doc.fontSize(9)
			   .font('Helvetica-Bold')
			   .fillColor('#ffffff')
			   .text('Zahlungsstatus:', 60, currentY + 4);
			
			doc.fontSize(10)
			   .text(statusText, 60, currentY + 16);
			
			if (invoice.paidAt) {
				currentY += 25;
				doc.fontSize(8)
				   .font('Helvetica-Bold')
				   .fillColor(COLORS.text)
				   .text('Bezahlt am:', 50, currentY);
				doc.font('Helvetica')
				   .fillColor(COLORS.textLight)
				   .text(new Date(invoice.paidAt).toLocaleDateString('de-DE', {
					   day: '2-digit',
					   month: '2-digit',
					   year: 'numeric'
				   }), 120, currentY);
			}

			// ========== FOOTER ==========
			const pageHeight = doc.page.height;
			// Footer immer am unteren Rand, kompakt
			const footerY = pageHeight - 60;
			
			// Farbiger Footer-Hintergrund (kompakt)
			doc.rect(50, footerY, 500, 60)
			   .fill(COLORS.primary)
			   .stroke(COLORS.primary);
			
			// Trennlinie (weiß)
			doc.moveTo(50, footerY + 3)
			   .lineTo(550, footerY + 3)
			   .lineWidth(1)
			   .strokeColor('#ffffff')
			   .stroke();
			
			// Firmenname (weiß, fett, kleiner)
			doc.fontSize(9)
			   .font('Helvetica-Bold')
			   .fillColor('#ffffff')
			   .text(COMPANY_INFO.name, 50, footerY + 10, { align: 'center', width: 500 });
			
			// Adresse (weiß, kleiner)
			doc.fontSize(7)
			   .font('Helvetica')
			   .fillColor('#ffffff')
			   .text(`${COMPANY_INFO.address}, ${COMPANY_INFO.city}`, 
					 50, footerY + 22, { align: 'center', width: 500 });
			
			// Kontaktinformationen (weiß, kleiner)
			doc.fontSize(7)
			   .text(`E-Mail: ${COMPANY_INFO.email} | Web: ${COMPANY_INFO.website}`, 
					 50, footerY + 32, { align: 'center', width: 500 });
			
			// USt-IdNr. (weiß, kleiner)
			doc.fontSize(6)
			   .text(`USt-IdNr.: ${COMPANY_INFO.taxId}`, 
					 50, footerY + 42, { align: 'center', width: 500 });
			
			// Support-Text (weiß, kleiner)
			doc.fontSize(6)
			   .fillColor('#e0e7ff')
			   .text('Bei Fragen kontaktieren Sie bitte unseren Support.', 
					 50, footerY + 52, { align: 'center', width: 500 });

			doc.end();
		} catch (error) {
			reject(error);
		}
	});
}
