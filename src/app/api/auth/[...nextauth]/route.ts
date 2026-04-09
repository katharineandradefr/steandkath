import NextAuth from "next-auth";

import { authOptions } from "~/server/auth/auth-options";

// NextAuth's App Router handler is not precisely typed for Route exports.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
