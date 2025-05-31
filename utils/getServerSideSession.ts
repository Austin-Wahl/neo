import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { User } from "@/prisma/generated/prisma";

export type Session = typeof auth.$Infer.Session & { user: User };

/**
 * Helper function which returns the logged in user's session or returns null in the event it does not exist or errors out.
 * @returns Promise<Session | null>
 */
const getServerSideSession = async (): Promise<Session | null> => {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    return session as Session;
  } catch (error) {
    console.log("[AUTH ERROR | GET SERVERSIDE SESSION]", error);
    return null;
  }
};

export default getServerSideSession;
