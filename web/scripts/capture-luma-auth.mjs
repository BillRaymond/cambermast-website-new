import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { chromium } from '@playwright/test';

const outputPath = process.argv[2]?.trim() || './.auth/luma.json';
const absoluteOutputPath = path.resolve(outputPath);

const rl = readline.createInterface({ input, output });

const browser = await chromium.launch({ headless: false });

try {
	const context = await browser.newContext();
	const page = await context.newPage();

	await page.goto('https://lu.ma/signin', { waitUntil: 'domcontentloaded' });

	output.write('\nLuma sign-in is open in the remote desktop browser.\n');
	output.write('Complete the login there, then return here and press Enter to save the session.\n\n');

	await rl.question('');

	await fs.mkdir(path.dirname(absoluteOutputPath), { recursive: true });
	await context.storageState({ path: absoluteOutputPath });

	output.write(`Saved storage state to ${absoluteOutputPath}\n`);
} finally {
	await rl.close();
	await browser.close();
}
