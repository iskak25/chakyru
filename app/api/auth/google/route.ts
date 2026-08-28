import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const credential = String(formData.get("credential") || "");
  const csrfBody = String(formData.get("g_csrf_token") || "");
  const csrfCookie = request.cookies.get("g_csrf_token")?.value || "";

  const login = new URL("/login", request.url);
  if (csrfCookie && csrfBody && csrfCookie !== csrfBody) {
    login.searchParams.set("err", "csrf");
    return NextResponse.redirect(login, 303);
  }
  if (!credential) {
    login.searchParams.set("err", "google");
    return NextResponse.redirect(login, 303);
  }

  const response = NextResponse.redirect(login, 303);
  response.cookies.set("chakyru-gis", credential, {
    path: "/",
    maxAge: 180,
    sameSite: "lax",
  });
  return response;
}

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
