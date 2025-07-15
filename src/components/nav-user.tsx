// components/nav-user.tsx
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconStar,
  IconCrown,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/hooks/use-theme";
import showDisabledToast from "./disabled-toast";
import { useNavigate } from "react-router-dom";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, profile, loading, signOut } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  // Don't render if still loading or no user
  if (loading || !user) {
    return null;
  }

  // Extract user data with fallbacks, prioritizing profile data
  const userName =
    profile?.full_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const userEmail = profile?.email || user?.email || "user@example.com";
  const userAvatar = user?.user_metadata?.avatar_url;
  const subscriptionTier = profile?.subscription_tier || 'demo';
  
  const getSubscriptionBadge = () => {
    switch (subscriptionTier) {
      case 'demo':
        return { name: 'Demo', icon: IconInfoCircle, variant: 'secondary' as const };
      case 'consultant':
        return { name: 'Consultant', icon: IconStar, variant: 'default' as const };
      case 'enterprise':
        return { name: 'Enterprise', icon: IconCrown, variant: 'default' as const };
      default:
        return { name: 'Demo', icon: IconInfoCircle, variant: 'secondary' as const };
    }
  };
  
  const subscriptionBadge = getSubscriptionBadge();
  const BadgeIcon = subscriptionBadge.icon;

  const handleAccountClick = () => {
    navigate('/account');
  };

  const handleBillingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showDisabledToast("Billing", "page");
  };

  const handleNotificationsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showDisabledToast("Notifications", "page");
  };

  // Determine which logo to use based on theme
  const logoSrc =
    resolvedTheme === "dark"
      ? "/assets/logos/vantage-logo-white.png"
      : "/assets/logos/vantage-logo.svg";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={userAvatar || logoSrc} alt={userName} />
                <AvatarFallback className="rounded-lg">V</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {userEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userAvatar || logoSrc} alt={userName} />
                  <AvatarFallback className="rounded-lg">V</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{userName}</span>
                    <Badge 
                      variant={subscriptionBadge.variant}
                      className="text-xs h-5 px-1.5 flex items-center gap-1"
                    >
                      <BadgeIcon className="h-3 w-3" />
                      {subscriptionBadge.name}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground truncate text-xs">
                    {userEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBillingClick}>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNotificationsClick}>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
