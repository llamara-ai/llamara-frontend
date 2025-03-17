import { useEffect, useState } from 'react';

export function useLogo() {
  const [logoSrc, setLogoSrc] = useState('/logo.svg');

  useEffect(() => {
    const updateLogo = () => {
      const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setLogoSrc(prefersDarkScheme ? '/logo-dark.svg' : '/logo.svg');
    };

    updateLogo(); // Initial check
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', updateLogo);

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', updateLogo);
    };
  }, []);

  return logoSrc;
}