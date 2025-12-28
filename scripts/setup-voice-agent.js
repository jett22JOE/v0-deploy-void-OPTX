/**
 * Grok Voice Agent Setup
 *
 * Sets up real-time voice interaction with your uploaded codebase
 * for code optimization and manipulation via voice commands.
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Configuration
const XAI_API_KEY = process.env.XAI_API_KEY || 'REDACTED_ROTATE_KEY';
const VOICE_API_KEY = 'JOE-agent-HEDGEHOG-grok4.1VOICE';
const PROJECT_ROOT = '/Users/jettoptx/v0-deploy-void-OPTX';

/**
 * Load collection ID from file
 */
function getCollectionId() {
  const idPath = path.join(PROJECT_ROOT, '.grok-collection-id');
  if (!fs.existsSync(idPath)) {
    throw new Error('Collection ID not found. Run upload-to-grok.js first.');
  }
  return fs.readFileSync(idPath, 'utf-8').trim();
}

/**
 * Initialize voice agent session
 */
async function initializeVoiceAgent() {
  const collectionId = getCollectionId();

  console.log('🎙️  Initializing Grok Voice Agent...\n');
  console.log(`Collection ID: ${collectionId}`);
  console.log(`API Key: ${VOICE_API_KEY}\n`);

  // Create WebSocket connection to Grok Voice API
  const ws = new WebSocket('wss://api.x.ai/v1/voice', {
    headers: {
      'Authorization': `Bearer ${XAI_API_KEY}`,
      'X-Voice-API-Key': VOICE_API_KEY,
      'X-Collection-ID': collectionId
    }
  });

  ws.on('open', () => {
    console.log('✅ Connected to Grok Voice API\n');
    console.log('🎤 Listening for voice commands...\n');
    console.log('Try saying:');
    console.log('  - "Optimize the Clerk webhook handler"');
    console.log('  - "Find security issues in authentication"');
    console.log('  - "Add error handling to OAuth callbacks"');
    console.log('  - "Generate tests for webhook endpoint"');
    console.log('  - "Refactor the loading page component"\n');
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    handleVoiceResponse(message);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });

  ws.on('close', () => {
    console.log('\n👋 Voice session ended');
  });

  return ws;
}

/**
 * Handle voice responses from Grok
 */
function handleVoiceResponse(message) {
  const { type, content, metadata } = message;

  switch (type) {
    case 'transcription':
      console.log(`\n🎤 You said: "${content}"`);
      break;

    case 'response':
      console.log(`\n🤖 Grok: ${content}\n`);

      // If Grok provides code suggestions
      if (metadata?.code) {
        console.log('📝 Suggested code changes:');
        console.log('─'.repeat(60));
        console.log(metadata.code);
        console.log('─'.repeat(60));

        // Save suggestion to file
        const timestamp = Date.now();
        const suggestionPath = path.join(
          PROJECT_ROOT,
          'grok-suggestions',
          `${timestamp}.json`
        );

        fs.mkdirSync(path.dirname(suggestionPath), { recursive: true });
        fs.writeFileSync(
          suggestionPath,
          JSON.stringify(metadata, null, 2)
        );

        console.log(`\n💾 Saved to: ${suggestionPath}`);
      }
      break;

    case 'analysis':
      console.log(`\n📊 Code Analysis:`);
      console.log('─'.repeat(60));
      console.log(content);
      console.log('─'.repeat(60));
      break;

    case 'error':
      console.error(`\n❌ Error: ${content}`);
      break;
  }
}

/**
 * Send voice command to Grok (for testing without actual voice)
 */
async function sendTextCommand(ws, command) {
  ws.send(JSON.stringify({
    type: 'text_command',
    content: command
  }));
}

/**
 * Main setup function
 */
async function setup() {
  try {
    const ws = await initializeVoiceAgent();

    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down voice agent...');
      ws.close();
      process.exit(0);
    });

    // Example: Send test command after 2 seconds (for demo)
    setTimeout(() => {
      console.log('\n📤 Sending test command...');
      sendTextCommand(ws, 'Analyze the Clerk webhook endpoint for optimization opportunities');
    }, 2000);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nMake sure you:');
    console.error('1. Ran upload-to-grok.js first');
    console.error('2. Have valid API keys in .env.local');
    console.error('3. Have network connectivity to api.x.ai');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setup();
}

module.exports = { initializeVoiceAgent, sendTextCommand };
