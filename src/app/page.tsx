import { cache } from "react";
import { auth } from "./(auth)/auth";
import { redirect } from "next/navigation";

const getSession = cache(() => auth());

export default async function Page() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth");
  }

  redirect("/chat");
}
