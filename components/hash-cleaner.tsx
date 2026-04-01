'use client';

import { useEffect } from 'react';

/**
 * Removes the legacy Facebook OAuth `#_=_` fragment that Facebook
 * appends to the redirect URI after authorization.
 */
export function HashCleaner() {
  useEffect(() => {
    if (window.location.hash === '#_=_') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  return null;
}
