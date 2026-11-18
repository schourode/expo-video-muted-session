import { requireOptionalNativeModule } from 'expo';

export type SessionState = {
  category: string;
  mode: string;
  options: string;
  otherAudioPlaying: string;
};

const SessionProbe = requireOptionalNativeModule<{ getSessionState(): SessionState }>('SessionProbe');

// iOS only. Returns null on other platforms.
export function getSessionState(): SessionState | null {
  return SessionProbe?.getSessionState() ?? null;
}
