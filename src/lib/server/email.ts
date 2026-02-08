import nodemailer from 'nodemailer';

// Email-Transporter konfigurieren
// TODO: In Produktion mit echtem SMTP-Server oder Service wie Resend/SendGrid verwenden
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp.ethereal.email',
	port: parseInt(process.env.SMTP_PORT || '587'),
	secure: false,
	auth: {
		user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
		pass: process.env.SMTP_PASS || 'ethereal.password'
	}
});

export async function sendVerificationEmail(email: string, token: string, name?: string) {
	const verificationUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

	const mailOptions = {
		from: process.env.SMTP_FROM || 'TitanNode <noreply@titannode.com>',
		to: email,
		subject: 'Bestätige deine Email-Adresse bei TitanNode',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🚀 Willkommen bei TitanNode!</h1>
					</div>
					<div class="content">
						<p>Hallo ${name || 'dort'},</p>
						<p>Danke für deine Registrierung bei TitanNode! Um deinen Account zu aktivieren, bestätige bitte deine Email-Adresse.</p>
						<p style="text-align: center;">
							<a href="${verificationUrl}" class="button">Email bestätigen</a>
						</p>
						<p>Oder kopiere diesen Link in deinen Browser:</p>
						<p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
						<p>Dieser Link ist 24 Stunden gültig.</p>
					</div>
					<div class="footer">
						<p>© ${new Date().getFullYear()} TitanNode. Alle Rechte vorbehalten.</p>
						<p>Falls du dich nicht registriert hast, ignoriere diese Email.</p>
					</div>
				</div>
			</body>
			</html>
		`
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('✅ Verification email sent:', info.messageId);
		
		// Für Entwicklung: Ethereal Preview URL
		if (process.env.NODE_ENV !== 'production') {
			console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
		}
		
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error('❌ Error sending email:', error);
		return { success: false, error };
	}
}

export async function sendWelcomeEmail(email: string, name?: string) {
	const dashboardUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/dashboard`;

	const mailOptions = {
		from: process.env.SMTP_FROM || 'TitanNode <noreply@titannode.com>',
		to: email,
		subject: '✅ Email bestätigt - Willkommen bei TitanNode!',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>✅ Willkommen bei TitanNode!</h1>
					</div>
					<div class="content">
						<p>Hallo ${name || 'dort'},</p>
						<p>Deine Email-Adresse wurde erfolgreich bestätigt!</p>
						<p>Du kannst jetzt alle Funktionen von TitanNode nutzen:</p>
						<ul>
							<li>VPS Server konfigurieren und bestellen</li>
							<li>Gameserver für deine Lieblingsspiele erstellen</li>
							<li>Apps deployen und hosten</li>
							<li>24/7 Support nutzen</li>
						</ul>
						<p style="text-align: center;">
							<a href="${dashboardUrl}" class="button">Zum Dashboard</a>
						</p>
					</div>
					<div class="footer">
						<p>© ${new Date().getFullYear()} TitanNode. Alle Rechte vorbehalten.</p>
					</div>
				</div>
			</body>
			</html>
		`
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('✅ Welcome email sent:', info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error('❌ Error sending email:', error);
		return { success: false, error };
	}
}

/** Passwort-Reset-Link per E-Mail senden */
export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
	const resetUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

	const mailOptions = {
		from: process.env.SMTP_FROM || 'TitanNode <noreply@titannode.com>',
		to: email,
		subject: 'Passwort zurücksetzen – TitanNode',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🔐 Passwort zurücksetzen</h1>
					</div>
					<div class="content">
						<p>Hallo ${name || 'dort'},</p>
						<p>du hast angefordert, dein Passwort bei TitanNode zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu setzen.</p>
						<p style="text-align: center;">
							<a href="${resetUrl}" class="button">Neues Passwort setzen</a>
						</p>
						<p>Oder kopiere diesen Link in deinen Browser:</p>
						<p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
						<p>Dieser Link ist 1 Stunde gültig.</p>
						<p>Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail – dein Passwort bleibt unverändert.</p>
					</div>
					<div class="footer">
						<p>© ${new Date().getFullYear()} TitanNode. Alle Rechte vorbehalten.</p>
					</div>
				</div>
			</body>
			</html>
		`
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('✅ Password reset email sent:', info.messageId);
		if (process.env.NODE_ENV !== 'production') {
			console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
		}
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error('❌ Error sending password reset email:', error);
		return { success: false, error };
	}
}

