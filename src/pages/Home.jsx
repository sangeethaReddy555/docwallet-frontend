import { Link } from "react-router-dom";
import { FileText, Shield, Cloud, Users, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0A0E16] text-slate-100 overflow-hidden flex items-center justify-center p-4">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/2 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 sm:p-12 border border-white/[0.06] animate-fadeInDown">
          {/* Animated Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-indigo-500/30 rounded-2xl blur-2xl animate-pulse"></div>
            <div className="relative p-5 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-2xl shadow-lg shadow-indigo-500/20">
              <FileText className="w-14 h-14 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Document Wallet
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-semibold tracking-wide uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Beta
            </span>
          </div>
          
          <p className="text-slate-400 text-base sm:text-lg mb-1">
            Your secure document management system
          </p>
          
          <div className="h-1 w-20 bg-gradient-to-r from-indigo-400 to-fuchsia-400 rounded-full mx-auto mb-6"></div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/10 text-indigo-300 text-xs font-medium rounded-full border border-indigo-400/20">
              <Shield className="w-3.5 h-3.5" />
              Secure
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-300 text-xs font-medium rounded-full border border-emerald-400/20">
              <Cloud className="w-3.5 h-3.5" />
              Cloud
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-500/10 text-purple-300 text-xs font-medium rounded-full border border-purple-400/20">
              <Users className="w-3.5 h-3.5" />
              Collaborative
            </span>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 rounded-xl bg-white/[0.04] text-slate-300 font-semibold border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all duration-200 hover:-translate-y-0.5"
            >
              Create Account
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Trusted worldwide
              </span>
              <span className="w-0.5 h-3 bg-white/[0.06] rounded-full" />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Free to start
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}