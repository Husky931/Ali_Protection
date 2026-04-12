import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { ReportStatus } from "@/lib/reportTypes";

const adminPassword = process.env.ADMIN_PASSWORD;

function isAuthorized(request: Request) {
  if (!adminPassword) {
    return false;
  }
  const header = request.headers.get("x-admin-password");
  return header === adminPassword;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { status?: ReportStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json(
      { error: "status must be approved or rejected." },
      { status: 400 },
    );
  }

  try {
    await db
      .update(reports)
      .set({ status: body.status, updated_at: new Date() })
      .where(eq(reports.id, id));
  } catch {
    return NextResponse.json(
      { error: "Failed to update report." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
