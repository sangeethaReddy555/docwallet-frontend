import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService.js";
import { validateRegisterForm } from "../utils/validators.js";
import { useToast } from "../context/ToastContext.jsx";
import { User, Mail, Lock, Shield, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const inputClass = 
  "w-full px-4 py-3 pl-11 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200";
const inputErrorClass = 
  "w-full px-4 py-3 pl-11 bg-white/[0.04] border border-rose-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200";
const labelClass = "block mb-1.5 text-sm font-semibold text-slate-300";
const errorTextClass = "mt-1.5 text-xs text-rose-400 flex items-center gap-1.5";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form and set field-specific errors
    const fieldErrors = { name: "", email: "", password: "", adminCode: "" };
    let hasError = false;

    if (!form.name.trim()) {
      fieldErrors.name = "Full name is required";
      hasError = true;
    }

    if (!form.email.trim()) {
      fieldErrors.email = "Email is required";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      fieldErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (!form.password) {
      fieldErrors.password = "Password is required";
      hasError = true;
    } else if (form.password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (hasError) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register(form);
      if (data.status === "approved") {
        toast.success("Admin account created — you can log in now");
        navigate("/login");
      } else {
        navigate("/pending-approval", { state: { email: form.email } });
      }
    } catch (err) {
      toast.error(err.message);
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
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Create Account</h1>
              <p className="text-sm text-slate-400 mt-0.5">Join Document Wallet</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  Full Name <span className="text-rose-400">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input 
                  className={errors.name ? inputErrorClass : inputClass} 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className={errorTextClass}>
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  Email <span className="text-rose-400">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input 
                  className={errors.email ? inputErrorClass : inputClass} 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className={errorTextClass}>
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  Password <span className="text-rose-400">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input 
                  className={errors.password ? inputErrorClass : inputClass} 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
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
              {errors.password && (
                <p className={errorTextClass}>
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Admin Code Field */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span>
                    Admin Code{" "}
                    <span className="text-xs font-normal text-slate-400">(Optional)</span>
                  </span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-slate-500" />
                </div>
                <input 
                  className={errors.adminCode ? inputErrorClass : inputClass} 
                  type={showAdminCode ? "text" : "password"} 
                  name="adminCode" 
                  value={form.adminCode} 
                  onChange={handleChange}
                  placeholder="Leave blank for regular users"
                />
                {form.adminCode && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-slate-300 transition-colors"
                    onClick={() => setShowAdminCode(!showAdminCode)}
                  >
                    {showAdminCode ? (
                      <EyeOff className="h-5 w-5 text-slate-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-500" />
                    )}
                  </button>
                )}
              </div>
              {errors.adminCode && (
                <p className={errorTextClass}>
                  <AlertCircle className="w-3 h-3" />
                  {errors.adminCode}
                </p>
              )}
            </div>

            {/* Required fields hint */}
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-rose-400">*</span> Required fields
            </p>

            {/* Submit Button */}
            <button
              className="w-full mt-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-sm text-slate-400 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Sign in
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