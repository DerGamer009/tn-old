/**
 * Generiert einen sicheren API-Key für die TitanNode Bot API (/api/bot/boost).
 *
 * Usage:
 *   npx tsx scripts/generate-bot-api-key.ts
 *
 * Den ausgegebenen Key in .env eintragen:
 *   TITANNODE_BOT_API_KEY=<generierter Key>
 */

import { randomBytes } from 'crypto';

const keyLength = 32; // Bytes → 64 Hex-Zeichen
const key = randomBytes(keyLength).toString('hex');

console.log('');
console.log('=== TitanNode Bot API Key ===');
console.log('');
console.log('Füge folgende Zeile in deine .env ein:');
console.log('');
console.log(`TITANNODE_BOT_API_KEY=${key}`);
console.log('');
console.log('Der Bot verwendet diesen Key im Header:');
console.log('  Authorization: Bearer ' + key);
console.log('');
console.log('Wichtig: Key sicher aufbewahren und nicht committen.');
console.log('');
