import { useEffect, useRef } from "react";

export function useHandleClickOutside<T extends HTMLElement>(
  onOutsideClick: (event: MouseEvent) => void,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick(event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [onOutsideClick]);

  return ref;
}
