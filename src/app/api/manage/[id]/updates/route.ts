import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { report_updates } from "@/lib/db/schema";
import { authorizeManage } from "@/lib/manageSession";

// Append an "Update:" note to an already-approved report (e.g. "the seller
// refunded me"). The note is moderated before it appears publicly; the original
// approved text is never altered.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return NextResponse.json({ error: "Unsupported content type." }, { status: 415 });
  }

  const report = await authorizeManage(id);
  if (!report) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (report.status !== "approved") {
    return NextResponse.json(
      { error: "You can add an update once your report is published." },
      { status: 400 },
    );
  }

  let body: { body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (text.length < 10) {
    return NextResponse.json(
      { error: "Please write at least a sentence." },
      { status: 400 },
    );
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: "That update is too long." }, { status: 400 });
  }

  await db.insert(report_updates).values({
    report_id: id,
    body: text,
    status: "pending",
  });

  return NextResponse.json({ ok: true });
}
