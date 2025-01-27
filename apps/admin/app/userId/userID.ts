import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export async function getUserId(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  const user_id = session?.user?.id;

  return user_id;
}
