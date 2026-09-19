import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://auth-token-reg-60069906069.development.catalystserverless.in/server/list-customers",
      {
        cache: "no-store",
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Could not load customer list.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
