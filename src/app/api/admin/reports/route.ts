import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";

const adminPassword = process.env.ADMIN_PASSWORD;

function isAuthorized(request: Request) {
  if (!adminPassword) {
    return false;
  }
  const header = request.headers.get("x-admin-password");
  return header === adminPassword;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const data = await db
      .select()
      .from(reports)
      .where(eq(reports.status, "pending"))
      .orderBy(desc(reports.created_at));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Failed to load reports." },
      { status: 500 },
    );
  }
}
