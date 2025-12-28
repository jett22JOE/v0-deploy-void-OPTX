/**
 * Upload Codebase to Grok Files API
 *
 * This script uploads your entire codebase to xAI's Files API
 * for voice-controlled code analysis and optimization.
 *
 * Requires: xai-sdk v1.4.0+
 * API Docs: https://docs.x.ai/docs/guides/files
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const fetch = require('node-fetch');
const FormData = require('form-data');

// Configuration
const XAI_API_KEY = process.env.XAI_API_KEY || 'REDACTED_ROTATE_KEY';
const PROJECT_ROOT = '/Users/jettoptx/v0-deploy-void-OPTX';
const SESSION_NAME = 'jett-optics-codebase';

// Files/folders to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.env',
  '.env.local',
  'package-lock.json',
  'pnpm-lock.yaml',
  '*.log',
  '.DS_Store'
];

/**
 * Recursively get all files in directory
 */
async function getAllFiles(dir, fileList = []) {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);

    // Skip excluded patterns
    if (EXCLUDE_PATTERNS.some(pattern => {
      if (pattern.includes('*')) {
        return file.endsWith(pattern.replace('*', ''));
      }
      return file === pattern || filePath.includes(`/${pattern}/`);
    })) {
      continue;
    }

    if (stats.isDirectory()) {
      await getAllFiles(filePath, fileList);
    } else {
      // Only include code files
      if (/\.(ts|tsx|js|jsx|json|md|css|scss)$/.test(file)) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

/**
 * Upload file to Grok Files API
 * https://docs.x.ai/docs/guides/files
 */
async function uploadFile(filePath) {
  const relativePath = filePath.replace(PROJECT_ROOT, '');
  const fileName = path.basename(filePath);

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('purpose', 'assistants');

    const response = await fetch('https://api.x.ai/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Failed to upload ${relativePath}: ${error}`);
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      path: relativePath,
      filename: fileName
    };
  } catch (error) {
    console.error(`❌ Error uploading ${relativePath}:`, error.message);
    return null;
  }
}

/**
 * Main upload function
 */
async function uploadCodebase() {
  try {
    console.log('🚀 Starting codebase upload to Grok Files API...\n');

    // Step 1: Get all files
    console.log('📂 Scanning project files...');
    const files = await getAllFiles(PROJECT_ROOT);
    console.log(`Found ${files.length} code files\n`);

    // Step 2: Upload files
    console.log('⬆️  Uploading files to Grok...\n');
    const fileIds = [];
    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
      const relativePath = file.replace(PROJECT_ROOT, '');
      process.stdout.write(`Uploading ${relativePath}...`);

      const result = await uploadFile(file);
      if (result) {
        fileIds.push(result);
        uploaded++;
        process.stdout.write(' ✅\n');
      } else {
        failed++;
        process.stdout.write(' ❌\n');
      }

      // Rate limiting - wait 200ms between uploads
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Upload Summary:');
    console.log('='.repeat(60));
    console.log(`Session Name: ${SESSION_NAME}`);
    console.log(`Total Files: ${files.length}`);
    console.log(`Uploaded: ${uploaded}`);
    console.log(`Failed: ${failed}`);
    console.log('='.repeat(60));

    // Save file IDs
    const manifestPath = path.join(PROJECT_ROOT, '.grok-files-manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        session: SESSION_NAME,
        uploaded: new Date().toISOString(),
        files: fileIds
      }, null, 2)
    );

    console.log('\n✅ Codebase uploaded successfully!');
    console.log(`\n💡 File manifest saved to: .grok-files-manifest.json`);
    console.log(`\n🎙️  Next: Use Voice API in xAI Dashboard!`);
    console.log(`\nSteps:`);
    console.log(`1. Open: https://console.x.ai/`);
    console.log(`2. Go to: Voice API tab`);
    console.log(`3. Select API Key: JOE-agent-HEDGEHOG-grok4.1VOICE`);
    console.log(`4. Click "Start" button`);
    console.log(`5. Say commands like:`);
    console.log(`   - "Analyze my uploaded codebase"`);
    console.log(`   - "Optimize the Clerk webhook handler"`);
    console.log(`   - "Find bugs in the signup flow"`);

  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  uploadCodebase();
}

module.exports = { uploadCodebase };
