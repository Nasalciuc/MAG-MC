import { useState } from 'react';
import { useMAGStore } from '../store/useMAGStore';
import { stateToURL, copyShareURL } from '../lib/serialization';

export function useShareURL() {
  const [copied, setCopied] = useState(false);
  const durations = useMAGStore(s => s.durations);
  const params = useMAGStore(s => s.params);
  const sectors = useMAGStore(s => s.sectors);

  const shareURL = async () => {
    const url = window.location.origin + stateToURL(durations, params, sectors);
    const ok = await copyShareURL(url);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  };

  return { shareURL, copied };
}
