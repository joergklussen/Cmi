import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const zip = 'crypto_market_intelligence_DIRECT_CRYPTO_V1.zip';
if (!existsSync(zip)) throw new Error(`Build archive missing: ${zip}`);
execFileSync('unzip', ['-o', zip, '-d', '.'], { stdio: 'inherit' });
console.log('CMI archive extracted successfully.');
