import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/account?next=/admin", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowed = profile?.role === "owner" || profile?.role === "staff";
    if (!allowed) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // صفحات المستخدمين والإعدادات: للمالك فقط
    const ownerOnly = ["/admin/users", "/admin/settings"];
    if (ownerOnly.some((p) => request.nextUrl.pathname.startsWith(p)) && profile?.role !== "owner") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
