"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function BrowseButton() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={() =>
          setMessage("Browse is available — ordering unlocks once approved.")
        }
      >
        Browse products (read-only)
      </Button>
      {message && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 px-5 py-2.5 text-[0.84rem] font-semibold whitespace-nowrap text-white">
          {message}
        </div>
      )}
    </div>
  );
}
