import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/timeline(.*)",
  "/servers(.*)",
  "/orgs(.*)",
  "/error(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if current route is protected
  if (isProtectedRoute(req)) {
    // Get auth state
    const { userId } = await auth();

    // Redirect to home if not authenticated
    if (!userId) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Allow request to continue if authenticated or route is not protected
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
