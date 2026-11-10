/** Future administrator-configured, read-only intranet knowledge boundary.
 * No implementation is registered in 0.1; private conversations are never uploaded.
 */
export interface KnowledgeQuery {
  query: string;
  limit: number;
  signal: AbortSignal;
}
export interface KnowledgeHit {
  id: string;
  title: string;
  excerpt: string;
  source: string;
}
export interface ReadOnlyKnowledgeConnector {
  readonly administratorEndpoint: URL;
  search(query: KnowledgeQuery): Promise<ReadonlyArray<KnowledgeHit>>;
}
