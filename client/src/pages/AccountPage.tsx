import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { User, Mail, Phone, Calendar, LogOut, Loader2, Package, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const [, navigate] = useLocation();
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) navigate("/login");
  }, [isLoading, isLoggedIn, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 flex items-start justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({ title: "Signed out", description: "You have been signed out successfully." });
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Failed to sign out. Please try again.", variant: "destructive" });
    }
  };

  const formatBirthday = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-center mb-2 uppercase" data-testid="text-account-title">My Account</h1>
        <p className="text-center text-muted-foreground text-sm mb-10">Manage your BESTA profile</p>

        <div className="border border-border p-6 mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-14 h-14 bg-foreground text-background flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold" data-testid="text-user-name">{user.name}</h2>
              <p className="text-sm text-muted-foreground" data-testid="text-user-mobile">+91 {user.mobile}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</p>
                <p className="text-sm" data-testid="text-profile-name">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Mobile Number</p>
                <p className="text-sm" data-testid="text-profile-mobile">+91 {user.mobile}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</p>
                <p className="text-sm" data-testid="text-profile-email">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Birthday</p>
                <p className="text-sm" data-testid="text-profile-birthday">{formatBirthday(user.birthday)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <Link
            href="/orders"
            data-testid="link-my-orders"
            className="w-full border border-border py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            My Orders
          </Link>
          {user.role === "admin" && (
            <Link
              href="/admin"
              data-testid="link-admin-panel"
              className="w-full border border-foreground bg-foreground text-background py-3.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </div>

        <button
          data-testid="button-logout"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="w-full border border-border py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {logout.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>
    </div>
  );
}
