import { useEffect, useState } from 'react';
import * as shopApi from '../api/shop.js';

/**
 * Fetches the currently equipped accessory's preview image so any screen can
 * show the pet "dressed up" exactly like the shop hero. Returns null when
 * nothing is equipped (or on error) — callers fall back to the base image.
 *
 * Each screen is mounted fresh on navigation, so the fetch-on-mount keeps the
 * preview in sync with whatever was last equipped in the shop.
 */
export function useEquippedPreview() {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    shopApi.getShop()
      .then(items => { if (!cancelled) setPreview(items.find(i => i.equipped)?.preview ?? null); })
      .catch(() => { if (!cancelled) setPreview(null); });
    return () => { cancelled = true; };
  }, []);

  return preview;
}
