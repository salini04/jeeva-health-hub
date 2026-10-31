import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Disclaimer } from "@/components/Disclaimer";
import { Logo } from "@/components/Logo";
import { useApp } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sign in — Jeeva" },
      { name: "description", content: "Sign in, create a Jeeva account, or continue with demo guest access." },
      { property: "og:title", content: "Sign in — Jeeva" },
      { property: "og:description", content: "Access your Jeeva health dashboard or explore in demo guest mode." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { auth, enterGuest, loading } = useApp();
  const navigate = useNavigate();
  const [guest, setGuest] = React.useState(false);
  const [login, setLogin] = React.useState({ email: "", password: "" });
  const [signup, setSignup] = React.useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [resetEmail, setResetEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  React.useEffect(() => {
    if (!loading && auth.signedIn && !auth.guest) void navigate({ to: "/dashboard", replace: true });
  }, [loading, auth.signedIn, auth.guest, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guest) { await enterGuest(); await navigate({ to: "/dashboard" }); return; }
    setBusy(true); setErrors({});
    try {
      const { error } = await supabase.auth.signInWithPassword(login);
      if (error) { setErrors({ password: error.message }); return; }
      toast.success("Signed in");
      await navigate({ to: "/dashboard" });
    } catch { setErrors({ password: "Sign-in unavailable. Please try again." }); }
    finally { setBusy(false); }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (signup.name.trim().length < 2) next["name"] = "Please enter your full name";
    if (signup.password.length < 8) next["spassword"] = "Use at least 8 characters";
    if (signup.password !== signup.confirm) next["confirm"] = "Passwords do not match";
    setErrors(next); if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: signup.email, password: signup.password,
        options: { data: { full_name: signup.name.trim() }, emailRedirectTo: window.location.origin } });
      if (error) { setErrors({ semail: error.message }); return; }
      if (!data.session) setNotice("Check your email to confirm your account, then sign in.");
      else await navigate({ to: "/dashboard" });
    } catch { setErrors({ semail: "Account creation unavailable. Please try again." }); }
    finally { setBusy(false); }
  };
  const sendReset = async () => {
    if (!/^\S+@\S+\.\S+$/.test(resetEmail)) { toast.error("Enter a valid email address"); return; }
    setBusy(true);
    try { const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) toast.error(error.message); else toast.success("Check your email for a password reset link.");
    } catch { toast.error("Reset link could not be sent."); } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Logo subtle />
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight">Your Health. Smarter Insights.</h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Track vitals, screen your risk, and understand what your numbers actually mean — with clear guidance on
            when to see a doctor.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/70">Educational use only. Not a medical diagnosis.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Demo guest access</p>
              <p className="text-xs text-muted-foreground">Skip sign-in and explore with sample data</p>
            </div>
            <Switch checked={guest} onCheckedChange={setGuest} aria-label="Demo guest access" />
          </div>

          {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
          <Tabs defaultValue="login">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="card-soft space-y-4 p-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email" required
                    value={login.email}
                    disabled={guest}
                    onChange={(e) => setLogin({ ...login, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                  {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password" required
                    value={login.password}
                    disabled={guest}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  {errors["password"] && <p className="text-xs text-destructive">{errors["password"]}</p>}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" type="button" className="h-auto p-0 text-xs">
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset your password</DialogTitle>
                      <DialogDescription>
                        We'll send a secure reset link to your email address.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="reset">Email</Label>
                      <Input id="reset" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <DialogFooter>
                      <Button disabled={busy} onClick={sendReset}>Send reset link</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button disabled={busy} type="submit" className="w-full">
                  {guest ? "Continue as guest" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="card-soft space-y-4 p-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} placeholder="Your name" />
                  {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semail">Email</Label>
                  <Input id="semail" type="email" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} placeholder="you@example.com" />
                  {errors["semail"] && <p className="text-xs text-destructive">{errors["semail"]}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="spassword">Password</Label>
                    <Input id="spassword" type="password" required value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
                    {errors["spassword"] && <p className="text-xs text-destructive">{errors["spassword"]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm</Label>
                    <Input id="confirm" type="password" required value={signup.confirm} onChange={(e) => setSignup({ ...signup, confirm: e.target.value })} />
                    {errors["confirm"] && <p className="text-xs text-destructive">{errors["confirm"]}</p>}
                  </div>
                </div>
                <Button disabled={busy} type="submit" className="w-full">Create account</Button>
              </form>
            </TabsContent>
          </Tabs>

          <Disclaimer compact />
        </div>
      </div>
    </div>
  );
}
