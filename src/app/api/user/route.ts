import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const MAX_PHONE_LENGTH = 256;

export async function GET() {
  try {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json(allUsers, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    await db.delete(users).where(eq(users.id, parseInt(userId)));
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim();
    const phoneNumber = (body?.phoneNumber ?? "").toString().trim();

    if (!name || !email || !phoneNumber) {
      return NextResponse.json(
        { error: "name, email, and phoneNumber are required" },
        { status: 400 },
      );
    }

    if (phoneNumber.length > MAX_PHONE_LENGTH) {
      return NextResponse.json(
        { error: `phoneNumber must be <= ${MAX_PHONE_LENGTH} characters` },
        { status: 400 },
      );
    }

    const [createdUser] = await db
      .insert(users)
      .values({
        name,
        email,
        phoneNumber,
      })
      .returning();

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

