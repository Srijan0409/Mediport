const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MediPort Application...\n');

// Function to start the backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting backend server...');
    
    const server = spawn('node', ['server.js'], {
      stdio: 'pipe',
      cwd: __dirname
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('📡 Backend:', output.trim());
      
      // Check if server is ready
      if (output.includes('Server running at http://localhost:3000')) {
        console.log('✅ Backend server is ready!');
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      console.error('❌ Backend Error:', data.toString());
    });

    server.on('error', (error) => {
      console.error('❌ Failed to start backend:', error);
      reject(error);
    });

    server.on('close', (code) => {
      console.log(`🔧 Backend server exited with code ${code}`);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Backend server startup timeout'));
    }, 10000);
  });
}

// Function to start the frontend (Electron)
function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('🖥️ Starting frontend (Electron)...');
    
    const electron = spawn('npm', ['start'], {
      stdio: 'pipe',
      cwd: __dirname
    });

    electron.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('🖥️ Frontend:', output.trim());
    });

    electron.stderr.on('data', (data) => {
      console.error('❌ Frontend Error:', data.toString());
    });

    electron.on('error', (error) => {
      console.error('❌ Failed to start frontend:', error);
      reject(error);
    });

    electron.on('close', (code) => {
      console.log(`🖥️ Frontend exited with code ${code}`);
    });

    resolve(electron);
  });
}

// Function to test the connection
async function testConnection() {
  console.log('🔍 Testing connection...');
  
  try {
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/test');
    const data = await response.json();
    console.log('✅ Connection test successful:', data);
    return true;
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

// Main startup function
async function startApp() {
  try {
    // Start backend first
    const backendServer = await startBackend();
    
    // Wait a moment for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.log('⚠️ Connection test failed, but continuing...');
    }
    
    // Start frontend
    const frontendApp = await startFrontend();
    
    console.log('\n🎉 MediPort Application Started Successfully!');
    console.log('📊 Dashboard: http://localhost:3000');
    console.log('🔐 Login: http://localhost:3000/login.html');
    console.log('🔧 API: http://localhost:3000/api');
    console.log('\n💡 Press Ctrl+C to stop the application');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down MediPort...');
      backendServer.kill();
      frontendApp.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

// Start the application
startApp();
