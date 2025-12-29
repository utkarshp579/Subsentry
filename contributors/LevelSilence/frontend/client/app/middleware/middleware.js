import { authMiddleware } from "@clerk/nextjs";

//except the home page all other pages are protected
export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
