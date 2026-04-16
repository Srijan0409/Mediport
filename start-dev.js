const startServer = require('./server');

async function startDevServer() {
  try {
    console.log('🚀 Starting development server...');
    const server = await startServer(3000);
    console.log('✅ Development server started on http://localhost:3000');
    console.log('📊 Dashboard: http://localhost:3000');
    console.log('🔐 Login: http://localhost:3000/login.html');
    console.log('🔧 Press Ctrl+C to stop the server');
  } catch (error) {
    console.error('❌ Failed to start development server:', error);
    process.exit(1);
  }
}

startDevServer();

