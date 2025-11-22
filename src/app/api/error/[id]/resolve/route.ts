import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    // INTEGRATION: Persist resolution state once the database schema supports it.

    return NextResponse.json(
      {
        id,
        resolved: true,
        message: "Resolve request received (no persistence configured).",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}