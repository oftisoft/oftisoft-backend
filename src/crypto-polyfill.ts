// Polyfill to ensure crypto is available globally for @nestjs/typeorm
// This is needed because @nestjs/typeorm uses crypto.randomUUID() which expects
// crypto to be available as a global variable in certain build configurations
import * as crypto from 'crypto';

// Make crypto available globally for both ES modules and CommonJS
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = crypto;
}

// Also ensure it's available on the global object for CommonJS compatibility
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = crypto;
}
