"use client";
import { useState } from "react";
import { insforge } from "@/lib/insforge";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await insforge.auth.signInWithPassword({ email, password });
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await insforge.auth.signInWithOAuth({
        provider: "google",
        redirectTo: `${window.location.origin}/`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google sign in failed";
      setError(message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.62)",
          border: "1px solid rgba(16,17,26,0.10)",
          borderRadius: "24px",
          padding: "2.5rem 2rem",
          boxShadow: "0 16px 36px rgba(16,17,26,0.05)",
          backdropFilter: "blur(14px)",
        }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <svg
            style={{ width: 40, height: 40, margin: "0 auto 0.75rem" }}
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="none"
              stroke="#1c3fdc"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M166 82c-8-4-17-6-27-6c-32 0-58 26-58 58s26 58 58 58c26 0 48-17 55-41c-7 4-16 6-25 6c-26 0-46-20-46-46c0-12 4-22 11-29c7-7 20-7 32 0z"
            />
          </svg>
          <h1
            style={{
              fontFamily:
                "var(--font-serif, 'DM Serif Display', Georgia, serif)",
              fontSize: "1.6rem",
              color: "var(--ink)",
              lineHeight: 1.2,
              marginBottom: "0.25rem",
            }}
          >
            DayDreamers
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--dust)",
              lineHeight: 1.5,
            }}
          >
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "0.6rem 0.85rem",
              fontSize: "0.78rem",
              color: "#dc2626",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: "0.85rem" }}>
            <label
              htmlFor="email"
              style={{
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "var(--ink)",
                display: "block",
                marginBottom: "0.35rem",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                height: "42px",
                background: "var(--paper)",
                border: "1.5px solid var(--rule)",
                borderRadius: "12px",
                fontSize: "0.85rem",
                padding: "0 0.85rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="password"
              style={{
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "var(--ink)",
                display: "block",
                marginBottom: "0.35rem",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              style={{
                width: "100%",
                height: "42px",
                background: "var(--paper)",
                border: "1.5px solid var(--rule)",
                borderRadius: "12px",
                fontSize: "0.85rem",
                padding: "0 0.85rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "999px",
              background:
                loading ? "var(--rule)" : "var(--cobalt)",
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 600,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.16s ease",
              marginBottom: "0.75rem",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            margin: "0.75rem 0",
          }}
        >
          <div
            style={{ flex: 1, height: "1px", background: "var(--rule)" }}
          />
          <span
            style={{ fontSize: "0.72rem", color: "var(--dust)" }}
          >
            or
          </span>
          <div
            style={{ flex: 1, height: "1px", background: "var(--rule)" }}
          />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          style={{
            width: "100%",
            height: "46px",
            borderRadius: "999px",
            background: "var(--paper)",
            border: "1.5px solid var(--rule)",
            color: "var(--ink)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.16s ease",
          }}
        >
          <svg
            style={{ width: 18, height: 18 }}
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Link to sign up */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.82rem",
            color: "var(--dust)",
            marginTop: "1.5rem",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            style={{
              color: "var(--cobalt)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
