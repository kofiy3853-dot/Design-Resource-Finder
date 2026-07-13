const { execSync } = require('child_process');

try {
  console.log('Building Tailwind CSS...');
  execSync('npx -y tailwindcss -i ./public/css/tailwind-input.css -o ./public/css/tailwind.css', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('Tailwind CSS built successfully!');
} catch (err) {
  console.error('Build failed:', err.message);
  process.exit(1);
}
