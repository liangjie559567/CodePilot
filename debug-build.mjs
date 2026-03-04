import { build } from 'next/dist/build/index.js';

try {
  await build(process.cwd(), null, false, false, true);
} catch (error) {
  console.error('Full error:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
