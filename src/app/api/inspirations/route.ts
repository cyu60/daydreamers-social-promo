import { createClient } from "@insforge/sdk";
import { NextRequest, NextResponse } from "next/server";

function getInsforge() {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const db = getInsforge();
  const { data, error } = await db.database
    .from("inspirations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { user_id, name, linkedin_url } = await req.json();
  if (!user_id || !name) {
    return NextResponse.json({ error: "Missing user_id or name" }, { status: 400 });
  }

  const db = getInsforge();
  const { data, error } = await db.database.from("inspirations").insert({
    user_id,
    name,
    linkedin_url: linkedin_url || "",
    sample_posts: "[]",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  const { id, user_id } = await req.json();
  if (!id || !user_id) {
    return NextResponse.json({ error: "Missing id or user_id" }, { status: 400 });
  }

  const db = getInsforge();
  const { error } = await db.database
    .from("inspirations")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const { id, user_id, sample_posts } = await req.json();
  if (!id || !user_id) {
    return NextResponse.json({ error: "Missing id or user_id" }, { status: 400 });
  }

  const db = getInsforge();
  const { data, error } = await db.database
    .from("inspirations")
    .update({ sample_posts: JSON.stringify(sample_posts) })
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
