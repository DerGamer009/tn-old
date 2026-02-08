import type { Actions, PageServerLoad } from './$types';
import { getJobBySlug } from '$lib/careers';
import { prisma } from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const job = getJobBySlug(params.slug);
	if (!job) {
		throw error(404, 'Stelle nicht gefunden');
	}
	return { job };
};

export const actions: Actions = {
	submit: async ({ request, params, locals }) => {
		const job = getJobBySlug(params.slug);
		if (!job) {
			return fail(404, { error: 'Stelle nicht gefunden' });
		}

		const formData = await request.formData();
		const firstName = (formData.get('firstName') as string)?.trim();
		const lastName = (formData.get('lastName') as string)?.trim();
		const email = (formData.get('email') as string)?.trim();
		const phone = (formData.get('phone') as string)?.trim() || undefined;
		const message = (formData.get('message') as string)?.trim() || undefined;

		if (!firstName || !lastName || !email) {
			return fail(400, { error: 'Bitte fülle alle Pflichtfelder aus (Name, E-Mail).' });
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
		}

		// Bereichsspezifische Antworten sammeln
		const answers: Record<string, string> = {};
		for (const q of job.applicationQuestions) {
			const val = formData.get(`q_${q.id}`) as string | null;
			if (val != null) answers[q.id] = val.trim();
		}

		await prisma.careerApplication.create({
			data: {
				jobSlug: job.slug,
				jobTitle: job.title,
				firstName,
				lastName,
				email,
				phone,
				message,
				answers,
				userId: locals.user?.id ?? null
			}
		});

		return { success: true };
	}
};
