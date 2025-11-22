import { NextResponse } from "next/server";

export async function POST() {
  try {
    // INTEGRATION: Trigger agent stress test endpoint here.
    return NextResponse.json(
      { message: "Stress test triggered successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to trigger stress test" },
      { status: 500 },
    );
  }
}

