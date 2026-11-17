/** The live engine feed and ACP may deliver the same message in different chunks.
 * Both come from the same authenticated engine; offsets prevent duplicate text.
 * Content stays in the editor/engine, not in this bounded receipt map. */
export class MessageDelivery {
  private replayed = new Set<string>();
  ignore(session: string, id: string) {
    const key = session + ":" + id;
    this.messages.delete(key);
    this.replayed.add(key);
    if (this.replayed.size > 4096)
      this.replayed.delete(this.replayed.values().next().value!);
  }
  private messages = new Map<
    string,
    { acp: number; event: number; delivered: number }
  >();
  chunk(session: string, id: string, text: string, source: "acp" | "event") {
    const key = session + ":" + id;
    if (this.replayed.has(key)) return source === "acp" ? text : "";
    const offsets = this.messages.get(key) ?? {
      acp: 0,
      event: 0,
      delivered: 0,
    };
    const previous = offsets[source];
    offsets[source] += text.length;
    const delta = text.slice(Math.max(0, offsets.delivered - previous));
    offsets.delivered = Math.max(offsets.delivered, offsets[source]);
    this.messages.delete(key);
    this.messages.set(key, offsets);
    if (this.messages.size > 4096)
      this.messages.delete(this.messages.keys().next().value!);
    return delta;
  }
  reset(session: string) {
    for (const key of this.replayed)
      if (key.startsWith(session + ":")) this.replayed.delete(key);
    for (const key of this.messages.keys())
      if (key.startsWith(session + ":")) this.messages.delete(key);
  }
}
