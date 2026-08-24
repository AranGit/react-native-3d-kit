import type { ModelSource } from '../types/public';

export function getModelSourceKey(source: ModelSource): string {
  return typeof source === 'number' ? `asset:${source}` : `uri:${source.uri}`;
}
