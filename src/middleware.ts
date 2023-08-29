import { clerkClient } from "@clerk/nextjs";
import { withClerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/sign-in*", "/sign-up*", "/example"];

const isPublic = (path: string) => {
  if (new RegExp("^/api/.*$").exec(path)) return true;

  const otherwise = publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );

  return !!otherwise;
};

function newUrl(request: NextRequest): string {
  const host = request.headers.get("host");
  return request.url.replace(/^[A-Za-z0-9]{12}/, host ?? "");
}

export default withClerkMiddleware(async (request: NextRequest) => {
  const url = newUrl(request);

  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();

  const { userId } = getAuth(request);

  if (!userId) {
    const signInUrl = new URL(
      process.env.NODE_ENV === "production"
        ? "https://accounts.everly.sh/sign-in"
        : "https://quality-snake-94.accounts.dev/sign-in",
      url
    );
    return NextResponse.redirect(signInUrl);
  }

  const user = await clerkClient.users.getUser(userId);

  if (!user.publicMetadata.customer) {
    if (request.nextUrl.pathname === "/purchase") return NextResponse.next();
    return NextResponse.redirect(new URL("/purchase", url));
  }

  if (request.nextUrl.pathname.includes("/admin")) {
    if (!user.publicMetadata.admin) {
      return NextResponse.redirect(new URL("/", url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher:
    "/((?!_next/image|_next/static|_ipx|favicon.ico|Kitty.png|Everly.png).*)",
};
