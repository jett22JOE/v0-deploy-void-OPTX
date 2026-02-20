/**
 * JOULE (Just-in-time Optical Universal Lock Encryption) Template Types
 *
 * Used for temporal binding of gaze authentication to prevent replay attacks.
 * Part of the JOSH-Spatial OS authentication framework.
 */

export type GazeTensor = "COG" | "EMO" | "ENV";

export interface PolynomialPosition {
  tensor: GazeTensor | null;
  holdStart: number | null;
  holdDuration: number;
  confirmed: boolean;
  confidence: number;
}

export interface TransitionVector {
  fromTensor: GazeTensor | null;
  toTensor: GazeTensor;
  transitionTime: number; // ms between positions
  gazePathLength: number; // normalized path length
}

export interface JOULETemplate {
  // Temporal binding
  timestamp: number;           // Unix ms when sequence started
  sessionNonce: string;        // Unique per-verification attempt (from server)
  expirationWindow: number;    // Default 30 seconds

  // Spatial binding
  gazeSequence: GazeTensor[];  // 5 positions
  holdDurations: number[];     // Actual hold times per position (ms)
  transitionVectors: TransitionVector[]; // Movement between positions

  // Polynomial encoding (Alexander/Jones knot theory)
  polynomialEncoding: string;  // "13211" format (COG=1, EMO=2, ENV=3)
  knotPolynomial: string;      // Derived from sequence + timing
  verificationHash: string;    // SHA-256 hash for server comparison
}

export interface GazeVerificationRequest {
  sessionNonce: string;
  jouleTemplate: JOULETemplate;
  walletAddress?: string;      // Optional Solana wallet for $OPTX minting
  clerkUserId: string;
}

export interface GazeVerificationResponse {
  success: boolean;
  verified: boolean;
  edgeApproved: boolean;
  adminApproved: boolean;
  errorMessage?: string;
  mintTransactionSig?: string; // If $OPTX was minted
  verificationId?: string;
}

// Tensor configuration matching AGTCircle
export const TENSOR_CONFIG: Record<GazeTensor, {
  number: number;
  label: string;
  emoji: string;
  colors: [string, string];
  angle: number; // degrees from top
}> = {
  COG: { number: 1, label: "COG", emoji: "🧠", colors: ["#fbbf24", "#f59e0b"], angle: 270 }, // Yellow - TOP
  EMO: { number: 2, label: "EMO", emoji: "💗", colors: ["#ec4899", "#f43f5e"], angle: 150 }, // Pink - BOTTOM LEFT
  ENV: { number: 3, label: "ENV", emoji: "👁", colors: ["#60a5fa", "#3b82f6"], angle: 30 },  // Blue - BOTTOM RIGHT
};

// Encode polynomial sequence to string
export function encodePolynomial(sequence: (GazeTensor | null)[]): string {
  return sequence
    .map(t => t ? TENSOR_CONFIG[t].number.toString() : "0")
    .join("");
}

// Decode string to polynomial sequence
export function decodePolynomial(encoded: string): GazeTensor[] {
  const tensorMap: Record<string, GazeTensor> = { "1": "COG", "2": "EMO", "3": "ENV" };
  return encoded.split("").map(c => tensorMap[c]).filter(Boolean);
}

// Generate verification hash (client-side preview, server validates)
export async function generateVerificationHash(
  nonce: string,
  sequence: GazeTensor[],
  holdDurations: number[],
  timestamp: number
): Promise<string> {
  const data = JSON.stringify({ nonce, sequence, holdDurations, timestamp });
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
