import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

// Einfache regelbasierte Bot-Logik für TitanNode
function generateBotResponse(question: string, pageContext?: string | null): string {
	const q = question.toLowerCase();

	// Kontext: Seite
	const ctx =
		pageContext === 'status'
			? 'Statusseite'
			: pageContext === 'dashboard'
			? 'Dashboard'
			: 'TitanNode Website';

	// Status / Uptime
	if (q.includes('status') || q.includes('offline') || q.includes('störung') || q.includes('uptime')) {
		return (
			`Ich bin der TitanNode Bot und helfe dir beim Überblick über unsere Systeme.\n\n` +
			`• Den aktuellen Status aller Dienste findest du auf https://status.titannode.org/\n` +
			`• Dort siehst du auch Wartungen, Vorfälle und Uptime‑Statistiken.\n\n` +
			`Wenn du mir sagst, welcher Service betroffen ist (z.B. VPS, Gameserver, App‑Hosting), kann ich dir genauer helfen.`
		);
	}

	// VPS / Server
	if (q.includes('vps') || q.includes('server') || q.includes('root') || q.includes('dedicated')) {
		return (
			`Fragen zu VPS oder Servern? Gerne!\n\n` +
			`• Unsere VPS‑Produkte findest du auf der Seite /vps.\n` +
			`• Im Kundenbereich unter /dashboard/vps kannst du deine bestehenden Server verwalten (Start, Stop, Neuinstallation usw.).\n` +
			`• Bei Performance‑ oder Verfügbarkeitsproblemen zuerst https://status.titannode.org/ prüfen, dann mit Details (Server‑ID, Standort) melden.`
		);
	}

	// Gameserver
	if (q.includes('gameserver') || q.includes('minecraft') || q.includes('csgo') || q.includes('rust')) {
		return (
			`Zu Gameservern kann ich dir Folgendes sagen:\n\n` +
			`• Alle Gameserver‑Angebote findest du im Bereich /gameserver.\n` +
			`• Für spezifische Spiele gibt es Unterseiten wie /gameserver/minecraft oder /gameserver/rust.\n` +
			`• Im Dashboard unter /dashboard/gameserver (falls freigeschaltet) verwaltest du deine aktiven Gameserver.\n\n` +
			`Wenn du mir das Spiel und dein Problem kurz beschreibst, kann ich dir eine passendere Empfehlung geben.`
		);
	}

	// App Hosting
	if (q.includes('app') || q.includes('hosting') || q.includes('uptime kuma') || q.includes('pterodactyl')) {
		return (
			`Für App‑Hosting bei TitanNode:\n\n` +
			`• Allgemeine Infos findest du auf /app-hosting.\n` +
			`• Im Dashboard‑Bereich /dashboard/apps kannst du deine Anwendungen verwalten (z.B. Node.js, Python, Uptime Kuma).\n` +
			`• Technische Details wie eingesetzte Eggs/Nests verwaltest du normalerweise nicht direkt, das übernimmt das System für dich.\n\n` +
			`Wenn du mir kurz sagst, welche App du hosten möchtest, kann ich dir ein passendes Produkt nennen.`
		);
	}

	// Preise / Rechnungen
	if (
		q.includes('preis') ||
		q.includes('kosten') ||
		q.includes('rechnung') ||
		q.includes('invoice') ||
		q.includes('zahlung') ||
		q.includes('paypal') ||
		q.includes('klarna') ||
		q.includes('stripe')
	) {
		return (
			`Zum Thema Preise und Zahlungen:\n\n` +
			`• Rechnungen und Zahlungsstatus findest du im Dashboard unter /dashboard/invoices.\n` +
			`• Guthaben/Credits verwaltest du unter /dashboard/credits.\n` +
			`• Wir unterstützen u.a. Stripe, PayPal und (konfigurationsabhängig) Klarna.\n\n` +
			`Wenn du mir die Rechnungsnummer oder Bestellung nennst, kann unser Support dir im nächsten Schritt gezielt helfen.`
		);
	}

	// Support / Tickets
	if (q.includes('support') || q.includes('hilfe') || q.includes('ticket') || q.includes('problem')) {
		return (
			`Kein Problem, ich helfe dir beim Support.\n\n` +
			`• Neue Support‑Tickets kannst du im Dashboard unter /dashboard/tickets erstellen.\n` +
			`• Den generellen Support‑Bereich erreichst du über /support.\n` +
			`• Wenn du bereits ein Ticket hast, nenne mir bitte die Ticket‑ID – dann kann unser Team schneller reagieren.\n\n` +
			`Schreibe mir jetzt gern kurz, worum es genau geht (z.B. „VPS startet nicht“ oder „Rechnung stimmt nicht“).`
		);
	}

	// Registrierung / Login
	if (
		q.includes('login') ||
		q.includes('einloggen') ||
		q.includes('passwort') ||
		q.includes('registrieren') ||
		q.includes('account')
	) {
		return (
			`Du hast Fragen zu Login oder Registrierung?\n\n` +
			`• Einloggen kannst du dich über /login, einen neuen Account erstellst du über /register.\n` +
			`• Nach der Registrierung musst du deine E‑Mail verifizieren (Link in der Mail).\n` +
			`• Im Dashboard siehst du dann alle deine Services, Rechnungen und Tickets.\n\n` +
			`Falls der Login fehlschlägt, sag mir bitte, ob du eine Fehlermeldung siehst und wie sie lautet.`
		);
	}

	// Fallback
	return (
		`Ich bin der TitanNode Bot und helfe dir auf der ${ctx}.\n\n` +
		`Ich bin mir nicht sicher, was du genau meinst. Diese Links sind meistens hilfreich:\n` +
		`• Status der Systeme: https://status.titannode.org/\n` +
		`• VPS & Hosting: /vps, /app-hosting\n` +
		`• Gameserver: /gameserver\n` +
		`• Hilfe & Support: /support, /dashboard/tickets\n\n` +
		`Schreibe mir bitte etwas genauer, wobei du Hilfe brauchst (z.B. „VPS offline“, „Rechnung fehlt“).`
	);
}

export const GET: RequestHandler = async ({ url }) => {
	const sessionToken = url.searchParams.get('sessionToken');

	if (!sessionToken) {
		return json({ success: false, error: 'sessionToken fehlt' }, { status: 400 });
	}

	const session = await (prisma as any).chatSession.findUnique({
		where: { sessionToken },
		include: {
			messages: {
				orderBy: { createdAt: 'asc' },
				take: 100
			}
		}
	});

	if (!session) {
		return json({ success: true, messages: [] });
	}

	return json({
		success: true,
		messages: session.messages.map((m: any) => ({
			id: m.id,
			content: m.content,
			sender: m.sender,
			createdAt: m.createdAt
		}))
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const { sessionToken, content } = body as {
			sessionToken?: string;
			content?: string;
		};

		if (!sessionToken || !content?.trim()) {
			return json({ success: false, error: 'sessionToken oder Inhalt fehlt' }, { status: 400 });
		}

		const trimmed = content.trim().slice(0, 2000);

		// Session sicherstellen (ggf. neu anlegen)
		let session = await (prisma as any).chatSession.findUnique({
			where: { sessionToken }
		});

		if (!session) {
			session = await (prisma as any).chatSession.create({
				data: {
					sessionToken,
					pageContext: 'unknown',
					userId: locals.user?.id ?? null
				}
			});
		}

		// User-Nachricht speichern
		await (prisma as any).chatMessage.create({
			data: {
				sessionId: session.id,
				content: trimmed,
				sender: 'USER'
			}
		});

		// Bot-Antwort generieren und speichern
		const botText = generateBotResponse(trimmed, session.pageContext);

		await (prisma as any).chatMessage.create({
			data: {
				sessionId: session.id,
				content: botText,
				sender: 'SYSTEM'
			}
		});

		return json({
			success: true
		});
	} catch (error) {
		console.error('LiveChat: Fehler beim Senden', error);
		return json({ success: false, error: 'Interner Fehler' }, { status: 500 });
	}
};

