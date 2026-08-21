import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService.js";
import { validateLoginForm } from "../utils/validators.js";
import { useToast } from "../context/ToastContext.jsx";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";

const inputClass = 
  "w-full px-4 py-3 pl-11 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200";
const labelClass = "block mb-1.5 text-sm font-semibold text-slate-300";

function StatusBanner({ status }) {
  if (!status) return null;

  const isPending = status === "pending";
  return (
    <div
      className={`mb-5 rounded-xl border p-4 text-sm animate-fadeInDown ${
        isPending 
          ? "bg-amber-500/10 border-amber-400/20 text-amber-300" 
          : "bg-rose-500/10 border-rose-400/20 text-rose-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
          isPending ? "bg-amber-400/10" : "bg-rose-400/10"
        }`}>
          <svg className={`w-4 h-4 ${isPending ? "text-amber-400" : "text-rose-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold">
            {isPending ? "Account awaiting approval" : "Access declined"}
          </p>
          <p className="mt-1 text-xs opacity-80 leading-relaxed">
            {isPending 
              ? "The admin has been notified. You'll be able to log in once approved." 
              : "An admin rejected this account's access request."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (statusBanner) setStatusBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusBanner(null);

    const validationError = validateLoginForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(form);
      toast.success("Logged in successfully");
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      if (err.status === 403 && /approval/i.test(err.message)) {
        setStatusBanner("pending");
      } else if (err.status === 403 && /rejected/i.test(err.message)) {
        setStatusBanner("rejected");
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

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
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8 border border-white/[0.06] animate-fadeInDown">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-400/20">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
              <p className="text-sm text-slate-400 mt-0.5">Sign in to your account</p>
            </div>
          </div>

          <StatusBanner status={statusBanner} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input 
                  className={inputClass} 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input 
                  className={inputClass} 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full mt-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-sm text-slate-400 text-center">
              No account?{" "}
              <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Create one now
              </Link>
            </p>
          </div>

          {/* Trust Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure • Encrypted • Private</span>
          </div>
        </div>
      </div>
    </div>
  );
}