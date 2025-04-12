import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TooFastPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Too Many Attempts</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        You&apos;ve tried to sign up too many times in a short period. Please
        wait a few minutes before trying again.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild>
          <Link href="/signin">Sign In Instead</Link>
        </Button>
      </div>
    </div>
  );
}
