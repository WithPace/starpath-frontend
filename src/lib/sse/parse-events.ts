export type ParsedSseEvent = {
  event: string;
  data: Record<string, unknown>;
};

export function parseSseEvents(input: string): ParsedSseEvent[] {
  const frames = input.split(/\n\n+/);
  const events: ParsedSseEvent[] = [];

  for (const frame of frames) {
    let eventName = "";
    const dataLines: string[] = [];

    for (const rawLine of frame.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trim());
      }
    }

    if (!eventName || dataLines.length === 0) continue;

    const dataRaw = dataLines.join("\n");
    try {
      const parsed = JSON.parse(dataRaw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        events.push({
          event: eventName,
          data: parsed as Record<string, unknown>,
        });
      }
    } catch {
      // Ignore malformed frames so one bad packet does not break full stream parsing.
    }
  }

  return events;
}
