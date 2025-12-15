import Link from "next/link";
import { Icons } from "@/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Global Background */}
      <div className="absolute inset-0 animated-gradient -z-20" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat -z-10 opacity-[0.07]" />

      {children}
    </div>
  );
}
