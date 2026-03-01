import Link from "next/link";
import { Activity } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A365D]">
          <Activity className="h-7 w-7 text-[#C5A832]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A365D]">404</h1>
        <p className="mt-2 text-[#64748B]">Página não encontrada</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-[#1A365D] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A365D]/90"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
