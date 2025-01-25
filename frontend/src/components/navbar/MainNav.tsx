"use client";

import { Button } from "../ui/button";
import { UserNav } from "./user-nav";
import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "./mode-toggle";
import { useRouter } from "next/navigation";

const Navbar = () => {
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

export default Navbar;
