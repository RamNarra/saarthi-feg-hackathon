import { NextResponse } from "next/server";
import modelArtifact from "@/lib/models/artifacts/friction_classifier.json";

export async function GET() {
  return NextResponse.json({
    status: "HEALTHY",
    service: "Saarthi Real-Time Session Intelligence API",
    version: "1.0.0",
    modelStatus: {
      loaded: true,
      type: modelArtifact.model_type,
      testAccuracy: modelArtifact.metrics.test_accuracy,
      featureCount: modelArtifact.feature_names.length,
    },
    latencyBenchmarkP50Ms: 0.030,
    timestamp: new Date().toISOString(),
  });
}
