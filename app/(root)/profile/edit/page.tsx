import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ROUTES from "@/constants/routes";
import { getUser } from "@/lib/actions/user.action";
import ProfileForm from "@/components/forms/ProfileForm";

const Page = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect(ROUTES.SIGN_IN);
  }

  const { success, data } = await getUser({ userId: session.user.id });
  if (!success) {
    return redirect(ROUTES.SIGN_IN);
  }

  const user = data?.user as User;

  return <ProfileForm user={user} />;
};
export default Page;
