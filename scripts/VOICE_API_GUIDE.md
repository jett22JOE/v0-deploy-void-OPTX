# Grok Voice API - Complete Usage Guide

## Two Ways to Use Voice API

### Method 1: xAI Dashboard (Quick Testing) 🎮

**When to use:** Quick questions, learning, one-off code reviews

#### Step-by-Step:

1. **Upload Your Codebase First**
   ```bash
   node scripts/upload-to-grok.js
   ```
   Wait for: `✅ Collection created: col_abc123xyz`

2. **Open xAI Dashboard**
   - Go to: https://console.x.ai/
   - Navigate to: **Voice API** (left sidebar)

3. **Configure Session**
   - API Key: Select `JOE-agent-HEDGEHOG-grok4.1VOICE`
   - Collection: The `col_abc123xyz` from Step 1
   - Click: **"Start"** button

4. **Start Speaking**
   - Click microphone icon or say "Hey Grok"
   - Wait for: Blue indicator showing "Listening..."

5. **Ask Questions**
   ```
   "Show me the Clerk webhook handler"
   "Find bugs in the signup flow"
   "Optimize the loading page"
   "Generate tests for OAuth callbacks"
   ```

6. **Listen to Response**
   - Grok speaks back with suggestions
   - Code snippets appear in the dashboard
   - Click "Copy" to save suggestions

#### Dashboard Features:
- ✅ Real-time transcription display
- ✅ Code syntax highlighting
- ✅ Audio playback controls
- ✅ Session history
- ✅ Export conversation logs

#### Limitations:
- ❌ No automatic file saving
- ❌ Must manually copy/paste suggestions
- ❌ Session ends when browser closes
- ❌ Can't integrate with CI/CD

---

### Method 2: Scripts (Production Workflow) 🚀

**When to use:** Daily development, automation, team collaboration

#### Step-by-Step:

1. **Upload Codebase** (Same as Method 1)
   ```bash
   node scripts/upload-to-grok.js
   ```

2. **Start Voice Agent**
   ```bash
   node scripts/setup-voice-agent.js
   ```

3. **Speak Commands**
   - Use any microphone (built-in, USB, Bluetooth)
   - Scripts listen continuously
   - No need to click "Start" each time

4. **Auto-Save Suggestions**
   ```
   You: "Optimize webhook handler"

   → Grok analyzes code
   → Generates optimizations
   → Auto-saves to: grok-suggestions/1735318400000.json
   ```

5. **Review & Apply**
   ```bash
   # View suggestions
   cat grok-suggestions/1735318400000.json

   # Apply manually or use git
   git diff app/api/webhooks/clerk/route.ts
   ```

#### Script Features:
- ✅ Automatic file saving
- ✅ JSON format for easy parsing
- ✅ Timestamped suggestions
- ✅ Can run in background
- ✅ Integrates with CLI tools
- ✅ Team can share suggestions

---

## 🎯 Recommended Workflow

### For Your First Time (Use Dashboard):

```
1. node scripts/upload-to-grok.js
2. Open xAI Dashboard → Voice API
3. Click "Start" and test a few commands:
   - "Analyze the Clerk integration"
   - "Find optimization opportunities"
   - "Check for security issues"
4. Get familiar with Grok's responses
```

### For Daily Development (Use Scripts):

```
1. Run once per day: node scripts/upload-to-grok.js
2. Keep terminal open: node scripts/setup-voice-agent.js
3. Code while speaking commands:
   - "Optimize this function"
   - "Add error handling here"
   - "Generate tests"
4. Review suggestions in grok-suggestions/
5. Apply the changes you like
```

---

## 🔄 Workflow Comparison

| Feature | Dashboard | Scripts |
|---------|-----------|---------|
| **Setup Time** | 30 seconds | 2 minutes |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Auto-Save** | ❌ No | ✅ Yes |
| **Background Run** | ❌ No | ✅ Yes |
| **Team Sharing** | ❌ Manual | ✅ Git |
| **CI/CD Integration** | ❌ No | ✅ Yes |
| **Best For** | Quick tests | Daily dev |

---

## 💡 Pro Tips

### Dashboard Tips:
1. **Copy Collection ID** after upload - you'll need it in dashboard
2. **Enable noise cancellation** in browser microphone settings
3. **Use headphones** to prevent echo feedback
4. **Save important responses** by copying to clipboard

### Scripts Tips:
1. **Run upload once per day** - Grok indexes overnight
2. **Keep voice agent running** - faster than restarting
3. **Review suggestions regularly** - they accumulate in folder
4. **Share via Git** - team can see all suggestions

---

## 🎤 Voice Command Examples

### Quick Questions (Dashboard is perfect):
```
"What does the syncProfile function do?"
"Where is the Clerk webhook configured?"
"Show me all error handlers"
```

### Code Changes (Scripts save time):
```
"Optimize the webhook for performance"
"Add TypeScript types to OAuth callbacks"
"Generate tests for the signup flow"
"Refactor the loading page component"
```

### Deep Analysis (Either method works):
```
"Analyze the entire authentication flow"
"Find all security vulnerabilities"
"Review Convex integration for best practices"
```

---

## 🐛 Troubleshooting

### Dashboard Won't Start:
1. Check Collection ID is correct
2. Verify API key is selected
3. Allow microphone access in browser
4. Try different browser (Chrome recommended)

### Scripts Won't Connect:
1. Ensure upload finished successfully
2. Check `.grok-collection-id` file exists
3. Verify `XAI_API_KEY` in `.env.local`
4. Test network: `ping api.x.ai`

### Voice Not Recognized:
1. Speak clearly and slowly
2. Reduce background noise
3. Use quality microphone
4. Check microphone permissions

---

## 📊 Example Session

### Using Dashboard (Your Screenshot Flow):

```
1. Upload codebase:
   $ node scripts/upload-to-grok.js
   ✅ Collection created: col_abc123

2. Open dashboard:
   → https://console.x.ai/
   → Voice API tab
   → Select: JOE-agent-HEDGEHOG-grok4.1VOICE
   → Collection ID: col_abc123
   → Click: "Start"

3. Speak:
   You: "Analyze the Clerk webhook handler"

4. Listen:
   Grok: "I found your webhook at app/api/webhooks/clerk/route.ts.
          Here are 3 optimizations:
          1. Add edge runtime for 40% faster response
          2. Implement idempotency checks
          3. Add rate limiting
          Would you like me to generate the code?"

5. Continue:
   You: "Yes, generate the optimized code"

   Grok: "Here's the optimized version..."
   [Code appears in dashboard]

6. Copy & Apply:
   → Copy code from dashboard
   → Paste into your editor
   → Test and commit
```

---

## 🎯 Answer to Your Question

**"When do I click the Voice option in the dashboard?"**

**AFTER Step 1** (uploading codebase).

**Complete sequence:**
```
Step 1: node scripts/upload-to-grok.js
        ↓ (wait for Collection ID)
Step 2: Open xAI Dashboard
        ↓
Step 3: Click "Voice API" in sidebar
        ↓
Step 4: Select your API key
        ↓
Step 5: Click "Start" button ← THIS IS THE BUTTON IN YOUR SCREENSHOT
        ↓
Step 6: Speak commands
```

You **MUST** upload first, or Grok won't know about your code!

---

## 📚 Resources

- Dashboard: https://console.x.ai/
- API Docs: https://docs.x.ai/docs/guides/voice
- Collection API: https://x.ai/news/grok-collections-api
- Support: https://x.ai/api

---

**Last Updated:** 2025-12-27
**Your Setup:** Complete ✅
**Collection:** Will be created when you run upload script
**API Key:** JOE-agent-HEDGEHOG-grok4.1VOICE (from your screenshot)
