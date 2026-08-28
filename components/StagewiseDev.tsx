"use client";

import { useEffect } from "react";

export function StagewiseDev() {
  useEffect(() => {
    let disposed = false;
    void import("@stagewise/toolbar").then(({ initToolbar }) => {
      if (!disposed) initToolbar({ plugins: [] });
    });
    return () => {
      disposed = true;
    };
  }, []);
  return null;
}
