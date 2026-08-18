import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function BrowseButton() {
  return (
    <Link href="/catalogue" className="block">
      <Button type="button">Browse products (read-only) →</Button>
    </Link>
  );
}
