import { Activity } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A365D]">
            <Activity className="h-7 w-7 text-[#C5A832]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A365D]">
              Tutor Co-Pilot
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Acesse com suas credenciais do Simulation
            </p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
