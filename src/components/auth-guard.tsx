"use client";
import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import Link from "next/link";

export function AuthBanner() {
  const [user, setUser] = useState<unknown>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    insforge.auth
      .getCurrentUser()
      .then((result) => {
        setUser(result.data?.user ?? null);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  if (!checked || user) return null;

  return (
    <div
      style={{
        background: "var(--cobalt-dim)",
        borderBottom: "1px solid rgba(28,63,220,0.15)",
        padding: "0.5rem 1rem",
        textAlign: "center",
        fontSize: "0.78rem",
        color: "var(--cobalt)",
      }}
    >
      <Link
        href="/auth/signin"
        style={{ fontWeight: 600, textDecoration: "underline" }}
      >
        Sign in
      </Link>{" "}
      to save your generations and build your content library.
    </div>
  );
}
