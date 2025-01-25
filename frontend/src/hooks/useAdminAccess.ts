import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export const useAdminAccess = (redirectPath: string = "/") => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        if (token.claims.admin) {
          setIsAdmin(true);
        } else {
          router.push(redirectPath);
        }
      } else {
        router.push(redirectPath);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, redirectPath]);

  return { isAdmin, loading };
};
