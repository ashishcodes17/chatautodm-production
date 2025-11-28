import { type NextRequest, NextResponse } from "next/server"

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl

//   // Protect all workspace routes (dashboard, automations, settings, instagram, etc.)
//   if (pathname.match(/^\/[a-zA-Z0-9_-]+\/(dashboard|automations|settings|instagram|contacts|form)/)) {
//     // Check if user has valid auth session cookie
//     const userSession = request.cookies.get("user_session")?.value

//     if (!userSession) {
//       // No session, redirect to home/login
//       return NextResponse.redirect(new URL("/", request.url))
//     }

//     try {
//       // Verify the session is valid JSON
//       const sessionData = JSON.parse(userSession)

//       if (pathname.includes("/automations/flow-builder")) {
//         // Ensure session has required token/auth data
//         if (!sessionData.token && !sessionData.id && !sessionData.email) {
//           return NextResponse.redirect(new URL("/", request.url))
//         }
//       }
//     } catch {
//       // Invalid session format, redirect to home/login
//       return NextResponse.redirect(new URL("/", request.url))
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     // Protect all workspace-specific routes
//     "/:wsid/dashboard",
//     "/:wsid/dashboard/:path*",
//     "/:wsid/automations/:path*",
//     "/:wsid/settings/:path*",
//     "/:wsid/instagram/:path*",
//     "/:wsid/contacts/:path*",
//     "/:wsid/form/:path*",
//   ],
// }


// import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   const userSession = request.cookies.get("user_session")?.value;

//   // If no session at all → redirect to login
//   if (!userSession) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/:wsid/dashboard/:path*",
//     "/:wsid/automations/:path*",
//     "/:wsid/settings/:path*",
//     "/:wsid/instagram/:path*",
//     "/:wsid/contacts/:path*",
//     "/:wsid/form/:path*",
//   ],
// };
export function middleware() {
  return NextResponse.next();
}
