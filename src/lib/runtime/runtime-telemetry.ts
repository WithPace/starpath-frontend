export type RuntimeTelemetryInput = {
  scope: string;
  message: string;
  context?: Record<string, unknown>;
  level?: "error" | "warn";
};

export type RuntimeTelemetryRecord = {
  timestamp: string;
  scope: string;
  message: string;
  level: "error" | "warn";
  context: Record<string, unknown>;
};

export function buildTelemetryRecord(input: RuntimeTelemetryInput): RuntimeTelemetryRecord {
  return {
    timestamp: new Date().toISOString(),
    scope: input.scope,
    message: input.message,
    level: input.level ?? "error",
    context: input.context ?? {},
  };
}

function defaultTelemetrySink(record: RuntimeTelemetryRecord): void {
  if (record.level === "warn") {
    console.warn("[runtime-telemetry]", record);
    return;
  }
  console.error("[runtime-telemetry]", record);
}

export function reportRuntimeError(
  input: RuntimeTelemetryInput,
  sink: (record: RuntimeTelemetryRecord) => void = defaultTelemetrySink,
): void {
  sink(buildTelemetryRecord(input));
}
