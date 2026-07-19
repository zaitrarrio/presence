import { getViduConfig, type ViduConfig } from './config';
import { MockTransport } from './mockTransport';
import { ViduClient } from './client';
import type { AvatarTransport } from './types';

/** Build the right transport for the current environment. */
export function createTransport(config: ViduConfig = getViduConfig()): AvatarTransport {
  return config.mode === 'live' ? new ViduClient(config) : new MockTransport();
}

export { getViduConfig };
export type { ViduConfig };
