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
    <div className="flex space-x-2 items-center justify-center px-4 sm:px-8">
      <ModeToggle />
      {user ? (
        <UserNav />
      ) : (
        <Button
          onClick={() => router.push("/signin")}
          className="dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-md"
        >
          Sign In
        </Button>
      )}
    </div>
  );
};

export default Navbar;
