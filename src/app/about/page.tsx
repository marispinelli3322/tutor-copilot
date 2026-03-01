import { Header } from "@/components/header";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AboutContent } from "./about-content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <AboutContent />
    </div>
  );
}
