import { useState, useEffect, RefObject } from "react";

export default function useElementSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const updateSize = () => {
      if (ref.current) {
        setSize({
          width: ref.current.clientWidth,
          height: ref.current.clientHeight,
        });
      }
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(ref.current);

    updateSize(); // Initial size

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
}
