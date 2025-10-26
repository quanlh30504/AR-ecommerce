import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserInfoForm from "@/Components/Profile/UserInfoForm";
import UserModel, { IUser } from "@/models/User";
import connectToDB from "@/lib/db";
import ProfileClientWrapper from "@/Components/Profile/ProfileClientWrapper";
import { motion } from "framer-motion";


export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  await connectToDB();
  const fullUserData = await UserModel.findById(session.user.id).lean();

  if (!fullUserData) {
    redirect("/login");
  }
  let safeUserData;
  try {
    safeUserData = JSON.parse(JSON.stringify(fullUserData));
  } catch (error) {
    console.error("Failed to parse user data:", error);
    safeUserData = null;
  }

  return (
    <ProfileClientWrapper fullUserData={fullUserData}>
      <UserInfoForm user={safeUserData} />
    </ProfileClientWrapper>
  );
}
