"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const SignOutButton = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onError: () => {
              toast.error("Não foi possível encerrar sessão");
            },
            onSuccess: () => {
              router.push("/authentication");
            },
          },
        })
      }
    >
      Sair
    </Button>
  );
};
