import { Skia } from "@shopify/react-native-skia";

const LIVE_BUTTON_SHADER_SOURCE = `
uniform float2 resolution;
uniform float phase;
uniform float energy;

half4 main(float2 position) {
  float2 safeResolution = max(resolution, float2(1.0));
  float2 uv = position / safeResolution;

  float3 emeraldDeep = float3(0.0196, 0.5882, 0.4118);
  float3 emeraldBright = float3(0.0627, 0.7255, 0.5059);
  float3 mintGlow = float3(0.6549, 0.9529, 0.8157);
  float3 baseColor = mix(emeraldDeep, emeraldBright, smoothstep(0.0, 1.0, uv.x));

  float diagonalPosition = uv.x + (1.0 - uv.y) * 0.32;
  float sweepCenter = -0.30 + phase * 1.66;
  float sweepDistance = abs(diagonalPosition - sweepCenter);
  float sweepCore = 1.0 - smoothstep(0.0, 0.09, sweepDistance);
  float sweepHalo = 1.0 - smoothstep(0.09, 0.27, sweepDistance);
  float pressEnergy = energy * 0.12;
  float glowMix = min(0.48, sweepCore * 0.34 + sweepHalo * 0.08 + pressEnergy);

  float topEdge = (1.0 - smoothstep(0.0, 0.12, uv.y)) * (0.07 + energy * 0.04);
  float3 finalColor = mix(baseColor, mintGlow, glowMix) + mintGlow * topEdge;

  return half4(finalColor.r, finalColor.g, finalColor.b, 1.0);
}
`;

export const LIVE_BUTTON_SHADER = Skia.RuntimeEffect.Make(LIVE_BUTTON_SHADER_SOURCE);
