import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { GazeTensor } from '../joule/types';

export interface GazeEvent {
  gazePoint: { x: number; y: number };
  section: GazeTensor;
  agtWeights: { cog: number; emo: number; env: number };
  confidence: number;
  isBlink: boolean;
  timestamp: number;
}

const classifyGaze = (x: number, y: number): GazeTensor => {
  // Use barycentric weights to determine dominant tensor
  // This ensures classification matches the AGT triangle distribution
  const weights = computeBarycentric(x, y);
  if (weights.cog >= weights.emo && weights.cog >= weights.env) return 'COG';
  if (weights.emo >= weights.env) return 'EMO';
  return 'ENV';
};

const computeBarycentric = (x: number, y: number) => {
  // AGT equilateral triangle (normalized coords matching TENSOR_CONFIG)
  const v0 = { x: 0, y: 0.577 };    // COG (top)
  const v1 = { x: -0.5, y: -0.289 }; // EMO (bottom-left)
  const v2 = { x: 0.5, y: -0.289 };  // ENV (bottom-right)

  const d00 = (v0.x - v1.x) ** 2 + (v0.y - v1.y) ** 2;
  const d01 = (v0.x - v1.x) * (v0.x - v2.x) + (v0.y - v1.y) * (v0.y - v2.y);
  const d11 = (v0.x - v2.x) ** 2 + (v0.y - v2.y) ** 2;
  const d20 = (x - v0.x) * (x - v1.x) + (y - v0.y) * (y - v1.y);
  const d21 = (x - v0.x) * (x - v2.x) + (y - v0.y) * (y - v2.y);

  const denom = d00 * d11 - d01 * d01;
  let v = (d11 * d20 - d01 * d21) / denom;
  let w = (d00 * d21 - d01 * d20) / denom;
  let u = 1 - v - w;

  u = Math.max(0, Math.min(1, u));
  v = Math.max(0, Math.min(1, v));
  w = Math.max(0, Math.min(1, w));

  return { cog: u, emo: v, env: w };
};

const calculateEAR = (landmarks: NormalizedLandmark[], isLeft: boolean) => {
  const idx = isLeft
    ? [33, 160, 158, 133, 153, 144]   // left eye
    : [362, 385, 387, 263, 373, 380]; // right eye
  const [p1, p2, p3, p4, p5, p6] = idx.map(i => landmarks[i]);

  const v1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
  const v2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
  const h = Math.hypot(p1.x - p4.x, p1.y - p4.y);
  return (v1 + v2) / (2 * h || 1);
};

export function computeGazeFromLandmarks(landmarks: NormalizedLandmark[]): GazeEvent {
  const leftIris = landmarks[468];
  const rightIris = landmarks[473];

  // Left eye gaze (0.75 scaling tuned to match Python/ARKit 0.3 threshold)
  const lx = (landmarks[33].x + landmarks[133].x) / 2;
  const ly = (landmarks[33].y + landmarks[133].y) / 2;
  const lw = Math.abs(landmarks[33].x - landmarks[133].x);
  const leftGx = (leftIris.x - lx) / (lw * 0.75);
  const leftGy = ((leftIris.y - ly) / (lw * 0.75)) * -1;

  // Right eye
  const rx = (landmarks[362].x + landmarks[263].x) / 2;
  const ry = (landmarks[362].y + landmarks[263].y) / 2;
  const rw = Math.abs(landmarks[362].x - landmarks[263].x);
  const rightGx = (rightIris.x - rx) / (rw * 0.75);
  const rightGy = ((rightIris.y - ry) / (rw * 0.75)) * -1;

  const gazePoint = { x: (leftGx + rightGx) / 2, y: (leftGy + rightGy) / 2 };

  const section = classifyGaze(gazePoint.x, gazePoint.y);
  const agtWeights = computeBarycentric(gazePoint.x, gazePoint.y);

  const leftEAR = calculateEAR(landmarks, true);
  const rightEAR = calculateEAR(landmarks, false);
  const isBlink = (leftEAR + rightEAR) / 2 < 0.22;

  const confidence = Math.min(
    leftIris.visibility ?? 1,
    rightIris.visibility ?? 1
  );

  return {
    gazePoint,
    section,
    agtWeights,
    confidence: Math.max(0.0, Math.min(1.0, confidence)),
    isBlink,
    timestamp: Date.now()
  };
}
