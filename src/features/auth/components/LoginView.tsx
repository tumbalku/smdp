"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!res || res.error) {
      setErrorMsg("Email atau kata sandi salah. Silakan coba lagi.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--jobster-sidebar-bg, #1e2139)" }}
      id="login-page-container"
    >
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col items-start justify-center px-16 flex-1 text-white">
        <div className="space-y-6 max-w-md">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg"
              style={{ background: "var(--jobster-accent, #6c63ff)" }}
            >
              S
            </div>
            <span className="text-2xl font-bold tracking-wide">SMDP Portal</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight">
            Kelola sertifikasi &{" "}
            <span style={{ color: "var(--jobster-accent, #6c63ff)" }}>
              kepatuhan
            </span>{" "}
            dokumen pegawai.
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Pantau kelayakan medis, keabsahan dokumen administrasi, dan kepatuhan regulasi kepegawaian Anda secara digital.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              "Verifikasi dokumen STR, SIP, KTP & Ijazah",
              "Pantau masa berlaku sertifikasi medis otomatis",
              "Audit Log Keamanan aktivitas kepegawaian",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "var(--jobster-accent, #6c63ff)" }}
                >
                  ✓
                </span>
                <span className="text-white/70 text-sm font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[480px] flex-shrink-0 bg-background px-6 py-12 lg:rounded-l-3xl shadow-2xl">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
            style={{ background: "var(--jobster-accent, #6c63ff)" }}
          >
            S
          </div>
          <span className="text-xl font-bold text-foreground">SMDP Portal</span>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground">
              Selamat Datang! 👋
            </h2>
            <p className="text-muted-foreground text-xs font-semibold">
              Masuk ke akun portal SMDP Anda
            </p>
          </div>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">Surel (Email Address)</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="pegawai@smdp.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700">Kata Sandi (Password)</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-white font-semibold text-base mt-2"
              style={{ background: "var(--jobster-accent, #6c63ff)" }}
              id="login-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Masuk...
                </>
              ) : (
                "Masuk (Sign In)"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
