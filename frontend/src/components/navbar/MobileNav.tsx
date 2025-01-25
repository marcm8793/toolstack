"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserNav } from "./user-nav";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ModeToggle } from "./mode-toggle";

const MobileNav = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="flex space-x-2">
      <ModeToggle />
      {user ? (
        <UserNav />
      ) : (
        <Button onClick={() => router.push("/signin")}>Sign In</Button>
      )}
    </div>
  );
};

export default MobileNav;
