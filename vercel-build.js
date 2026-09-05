import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const archive = 'crypto_market_intelligence_AUTOMATION_V8_3_BLOCKPN.zip';
if (!existsSync(archive)) throw new Error(`Missing ${archive}`);

execFileSync('unzip', ['-oq', archive, '-d', '.'], { stdio: 'inherit' });
console.log('CMI V8.3 extracted for Vercel deployment.');
