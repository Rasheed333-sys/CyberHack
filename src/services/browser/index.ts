// Browser engine service abstraction — will eventually manage isolated
// browsing sessions (separate cookie jars/storage per session, relay/Tor
// routing for "private" and "high-privacy" modes). Not implemented yet:
// this module only tracks the selected mode for the UI.
import type { BrowsingMode } from '@/types';

export const browserModes: { id: BrowsingMode; label: string; description: string }[] = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Normal web access. No additional privacy routing.',
  },
  {
    id: 'private',
    label: 'Private',
    description: 'Traffic is intended to pass through the CyberHack privacy gateway once connected.',
  },
  {
    id: 'high-privacy',
    label: 'High Privacy',
    description: 'Most restrictive mode: relay routing, strict isolation, fingerprint resistance (planned).',
  },
];

export const browserService = {
  modes: browserModes,
};