import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// export default clerkMiddleware();

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)','/','testui1', '/testui2', '/testui3', '/testui4', '/testui5', '/testui6', '/testui7', '/testui8', '/testui9', '/testui10']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};