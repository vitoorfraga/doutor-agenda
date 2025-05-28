"use client";

import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agendamentos",
    url: "/appointments",
    icon: CalendarDays,
  },
  {
    title: "Médicos",
    url: "/doctors",
    icon: Stethoscope,
  },
  {
    title: "Pacientes",
    url: "/patients",
    icon: UsersRound,
  },
];

export const AppSidebar = () => {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
        onError: () => {
          toast.error("Não foi possível encerrar sessão");
        },
      },
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Image
          src="/doutor-agenda-logo.svg"
          alt="Logo"
          width={136.52}
          height={27.79}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full"
                >
                  <LogOut />
                  Sair
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
