# Grok Voice API Setup for Code Optimization

This directory contains scripts to upload your codebase to Grok Collections and enable voice-controlled code manipulation.

## Quick Start

### Step 1: Install Dependencies
```bash
npm install ws node-fetch
```

### Step 2: Upload Codebase
```bash
node scripts/upload-to-grok.js
```

This will:
- Scan your entire project (excluding node_modules, .next, etc.)
- Create a Grok Collection named "jett-optics-codebase"
- Upload all TypeScript, JavaScript, JSON, and Markdown files
- Save the Collection ID to `.grok-collection-id`

Expected output:
```
🚀 Starting codebase upload to Grok Collections...
📂 Scanning project files...
Found 127 code files
📦 Creating Grok Collection...
✅ Collection created: col_abc123xyz
⬆️  Uploading files...
Uploading /app/page.tsx... ✅
Uploading /components/hero.tsx... ✅
...
✅ Codebase uploaded successfully!
```

### Step 3: Start Voice Agent
```bash
node scripts/setup-voice-agent.js
```

This will:
- Connect to Grok Voice API via WebSocket
- Enable real-time voice commands
- Save code suggestions to `grok-suggestions/` directory

Expected output:
```
🎙️  Initializing Grok Voice Agent...
Collection ID: col_abc123xyz
✅ Connected to Grok Voice API
🎤 Listening for voice commands...
```

## Voice Commands You Can Use

### Code Optimization
- "Optimize the Clerk webhook handler"
- "Make the loading page component more performant"
- "Reduce bundle size in the signup flow"

### Bug Detection
- "Find security issues in the authentication system"
- "Check for race conditions in user sync"
- "Identify missing error handlers"

### Code Generation
- "Generate tests for the webhook endpoint"
- "Create a rate limiting middleware"
- "Add TypeScript types to the OAuth callbacks"

### Refactoring
- "Refactor the loading page to use server components"
- "Extract the error handling into a custom hook"
- "Simplify the ClerkProvider configuration"

### Analysis
- "Analyze the codebase for potential bugs"
- "Review the Convex integration for best practices"
- "Check for unused dependencies"

## How It Works

1. **Upload Phase**: `upload-to-grok.js` creates a searchable index of your entire codebase in Grok Collections using OCR and layout-aware parsing.

2. **Voice Phase**: `setup-voice-agent.js` establishes a WebSocket connection to Grok Voice API with less than 1 second latency.

3. **Processing**: When you speak a command:
   - Speech is transcribed to text
   - Grok searches your uploaded codebase
   - AI analyzes the relevant code
   - Suggestions are generated and spoken back
   - Code changes are saved to `grok-suggestions/`

4. **Application**: You review suggestions and manually apply them to your codebase.

## File Structure

```
scripts/
├── upload-to-grok.js      # Upload codebase to Collections
├── setup-voice-agent.js   # Start voice interaction
└── README.md              # This file

.grok-collection-id        # Generated after upload
grok-suggestions/          # AI-generated code suggestions
  ├── 1234567890.json      # Timestamped suggestions
  └── ...
```

## Configuration

### Environment Variables
```bash
# .env.local
XAI_API_KEY=REDACTED_ROTATE_KEY
```

### Excluded Files/Folders
The upload script automatically excludes:
- `node_modules/`
- `.next/`
- `.git/`
- `*.log`
- `.env` files
- Lock files

To customize exclusions, edit `EXCLUDE_PATTERNS` in `upload-to-grok.js`.

## Troubleshooting

### "Collection ID not found"
**Solution**: Run `upload-to-grok.js` first to create the collection.

### "Failed to upload files"
**Solution**:
1. Check your XAI_API_KEY is valid
2. Verify network connectivity to api.x.ai
3. Try uploading again (it's idempotent)

### "WebSocket connection failed"
**Solution**:
1. Ensure Voice API key (JOE-agent-HEDGEHOG-grok4.1VOICE) is active
2. Check firewall allows WSS connections
3. Verify Collection ID exists in `.grok-collection-id`

### Voice commands not responding
**Solution**:
1. Speak clearly and pause between commands
2. Use specific file/function names
3. Check console for transcription accuracy

## Advanced Usage

### Text Commands (No Voice)
```javascript
const { initializeVoiceAgent, sendTextCommand } = require('./setup-voice-agent');

const ws = await initializeVoiceAgent();
sendTextCommand(ws, 'Optimize the webhook handler');
```

### Custom Voice Commands
Extend `handleVoiceResponse()` in `setup-voice-agent.js` to add custom logic:

```javascript
case 'response':
  if (content.includes('apply changes')) {
    // Automatically apply code changes
    applyCodeChanges(metadata.code);
  }
  break;
```

### Batch Processing
```bash
# Upload and immediately start voice session
node scripts/upload-to-grok.js && node scripts/setup-voice-agent.js
```

## Resources

- [Grok Voice API Documentation](https://docs.x.ai/docs/guides/voice)
- [Grok Collections API](https://x.ai/news/grok-collections-api)
- [xAI API Reference](https://docs.x.ai/docs/api-reference)

## Support

For issues with the scripts:
1. Check the error message in console
2. Verify API keys are correct
3. Ensure you've run `upload-to-grok.js` first

For Grok API issues:
- Visit https://x.ai/api for support
- Check status at https://status.x.ai
