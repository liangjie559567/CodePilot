process.env.NODE_ENV = 'production';
import('next/dist/build/index.js').then(mod => {
  console.log('Available exports:', Object.keys(mod));
}).catch(err => {
  console.error('Import error:', err);
});
