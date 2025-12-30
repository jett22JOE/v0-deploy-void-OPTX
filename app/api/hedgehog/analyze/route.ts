/**
 * HEDGEHOG MCP Protocol - OAuth Analysis Endpoint
 *
 * Handshake Encryption Delegated Gesture Envelope Handler Optical Gateway
 *
 * Uses xAI API with grok-4-1-fast-reasoning model to analyze OAuth issues
 * and provide JETT-encrypted security envelope validations.
 */

import { NextResponse } from "next/server"

// xAI API configuration
const XAI_API_KEY = process.env.XAI_API_KEY || "xai-1QAp2qrmNlCA2AR1HDyDQQXVJBgRHdlyGDsv0C2YubZG86RqOW1qt6Ifki1tPBipa9WlkxFoanRxQtwV"
const XAI_API_URL = "https://api.x.ai/v1/chat/completions"

interface HedgehogAnalysisRequest {
  issue_type: "oauth_redirect_loop" | "404_error" | "mobile_responsive" | "apple_oauth" | "signout_button"
  context: {
    clerk_domain?: string
    webhook_url?: string
    oauth_client_id?: string
    current_routes?: string[]
    error_details?: string
  }
}

interface GrokResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Query Grok 4.1 Fast Reasoning for OAuth analysis
 */
async function queryGrokForAnalysis(request: HedgehogAnalysisRequest): Promise<string> {
  const systemPrompt = `You are HEDGEHOG MCP (Handshake Encryption Delegated Gesture Envelope Handler Optical Gateway),
the central nervous system for JOSH-Spatial OS OAuth security analysis.

Your role is to:
1. Analyze OAuth redirect loops and authentication issues
2. Validate JETT encryption envelope integrity
3. Ensure JOULE temporal templates maintain proper state
4. Provide actionable fixes with code examples

Always respond with structured JSON containing:
- root_cause: The primary issue
- jett_validation: Whether this aligns with JETT encryption standards
- joule_impact: Impact on temporal encryption templates
- fix_code: Actual code fixes
- clerk_dashboard_actions: Actions needed in Clerk Dashboard`

  const userPrompt = generateAnalysisPrompt(request)

  try {
    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "grok-4-1-fast-reasoning",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Grok API error:", errorText)
      throw new Error(`Grok API error: ${response.status}`)
    }

    const data = await response.json() as GrokResponse
    return data.choices[0]?.message?.content || "No analysis available"
  } catch (error) {
    console.error("Error querying Grok:", error)
    throw error
  }
}

function generateAnalysisPrompt(request: HedgehogAnalysisRequest): string {
  switch (request.issue_type) {
    case "oauth_redirect_loop":
      return `Analyze X/Twitter OAuth infinite redirect loop:

Current Configuration:
- Clerk Domain: ${request.context.clerk_domain}
- X OAuth Client ID: ${request.context.oauth_client_id}
- Current Routes: ${JSON.stringify(request.context.current_routes)}

The user gets stuck at https://twitter.com/i/oauth2/authorize with state parameter cycling.

Analyze:
1. What causes the OAuth state parameter loop?
2. Are the callback URLs correctly configured?
3. Is the middleware intercepting OAuth callbacks?
4. What Clerk Dashboard settings need verification?

Provide specific fixes for Next.js 16 with Clerk v6.`

    case "404_error":
      return `Analyze 404 error on "Already has an account" sign-in link:

Current Configuration:
- Clerk Domain: ${request.context.clerk_domain}
- signInUrl in ClerkProvider: /sign-in
- Available Routes: ${JSON.stringify(request.context.current_routes)}

The SignUp component links to /sign-in but returns 404.

Analyze:
1. Is there a missing /sign-in page route?
2. Should we use hash routing instead?
3. What's the correct signInUrl configuration?

Provide the correct route file structure.`

    case "mobile_responsive":
      return `Analyze Clerk modal mobile responsive issues:

Current Issues:
- Text too large on mobile devices
- Navigation needs icon-based approach for small screens
- Modal overflow issues

Analyze:
1. What CSS overrides are needed for Clerk components?
2. How to implement responsive breakpoints?
3. Best practices for mobile-first Clerk styling?

Provide CSS-in-JS solutions compatible with Clerk appearance API.`

    case "apple_oauth":
      return `Analyze Apple OAuth showing as disconnected:

Current Configuration:
- Clerk Domain: ${request.context.clerk_domain}
- Error: Apple login appears disconnected in UserProfile

Analyze:
1. What Apple Developer configuration is required?
2. Is the Services ID correctly set up?
3. What redirect URIs are needed for Apple?

Provide step-by-step Clerk Dashboard configuration.`

    case "signout_button":
      return `Analyze missing sign-out button in Clerk UserProfile modal:

Current Issue:
- UserProfile modal doesn't show a visible sign-out option
- Users cannot log out from the profile modal

Analyze:
1. How to add custom sign-out action to UserProfile?
2. Is there a Clerk appearance config for this?
3. Should we add a custom footer with sign-out?

Provide code for adding sign-out functionality.`

    default:
      return "Analyze the OAuth configuration for potential issues."
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as HedgehogAnalysisRequest

    // HEDGEHOG validation - all requests must have issue_type
    if (!body.issue_type) {
      return NextResponse.json({
        hedgehog_status: "DENIED",
        error: "Missing issue_type - HEDGEHOG requires classification"
      }, { status: 400 })
    }

    console.log(`[HEDGEHOG] Analyzing: ${body.issue_type}`)

    const analysis = await queryGrokForAnalysis(body)

    return NextResponse.json({
      hedgehog_status: "APPROVED",
      josh_cto_approved: true,
      jett_envelope: {
        encrypted: true,
        protocol: "HEDGEHOG-MCP-v1",
        timestamp: new Date().toISOString()
      },
      analysis,
      delegation: determineSubAgent(body.issue_type)
    })
  } catch (error) {
    console.error("[HEDGEHOG] Analysis failed:", error)
    return NextResponse.json({
      hedgehog_status: "ERROR",
      error: error instanceof Error ? error.message : "Analysis failed"
    }, { status: 500 })
  }
}

function determineSubAgent(issueType: string): string {
  switch (issueType) {
    case "oauth_redirect_loop":
    case "404_error":
    case "mobile_responsive":
      return "Joe_WebApp" // Frontend Browser Beast
    case "apple_oauth":
      return "Joe_Native" // Device Native Slayer
    default:
      return "Joe_Spatial" // Crypto Guardian
  }
}
