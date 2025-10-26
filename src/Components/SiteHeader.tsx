import { getUserForHeader } from "@/lib/actions/user";
import Header from "@/Components/header";

export default async function SiteHeader() {
  const userData = await getUserForHeader();
  return <Header initialUserData={userData} />;
}
