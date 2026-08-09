import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The cron endpoint is called by an external scheduler (Vercel Cron / cron-job.org),
// not a logged-in browser session — it can't go through Clerk's session auth.
// It already has its own optional CRON_SECRET protection (see the route itself).
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/cron(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};