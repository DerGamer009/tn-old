import { prisma } from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Test-Endpoint um zu prüfen, ob die Datenbankverbindung funktioniert
export const GET: RequestHandler = async () => {
	try {
		// Prüfe Datenbankverbindung
		await prisma.$connect();
		
		// Zähle Benutzer
		const userCount = await prisma.user.count();
		
		return json({
			success: true,
			message: 'Datenbankverbindung erfolgreich!',
			data: {
				userCount
			}
		});
	} catch (error) {
		console.error('Datenbankfehler:', error);
		return json(
			{
				success: false,
				message: 'Datenbankverbindung fehlgeschlagen',
				error: error instanceof Error ? error.message : 'Unbekannter Fehler'
			},
			{ status: 500 }
		);
	}
};

