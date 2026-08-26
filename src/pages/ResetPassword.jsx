import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authService } from "../services/authService.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const inputClass =
  "w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200";
const inputErrorClass =
  "w-full px-4 py-3 bg-white/[0.04] border border-rose-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200";
const labelClass = "block mb-1.5 text-sm font-semibold text-slate-300";
const errorTextClass = "mt-1.5 text-xs text-rose-400 flex items-center gap-1.5";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const initialEmail = searchParams.get("email") || "";
  const toast = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ email: "", otp: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otp];

    if (cleaned.length > 1) {
      const pastedDigits = cleaned.slice(0, 6).split("");
      pastedDigits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    } else {
      newOtp[index] = cleaned;
      setOtp(newOtp);
      if (cleaned && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }

    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = { email: "", otp: "", password: "", confirmPassword: "" };
    let hasError = false;

    if (!token) {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        fieldErrors.email = "Please enter a valid email address";
        hasError = true;
      }

      const otpCode = otp.join("");
      if (!otpCode || otpCode.length !== 6) {
        fieldErrors.otp = "Please enter the 6-digit verification code";
        hasError = true;
      }
    }

    if (!form.password) {
      fieldErrors.password = "Password is required";
      hasError = true;
    } else if (form.password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (!form.confirmPassword) {
      fieldErrors.confirmPassword = "Please confirm your password";
      hasError = true;
    } else if (form.password !== form.confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      if (token) {
        await authService.resetPassword({ token, password: form.password });
      } else {
        await authService.resetPassword({
          email,
          otp: otp.join(""),
          password: form.password,
        });
      }
      setResetComplete(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
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
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Reset Password
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Verify code and enter your new password
              </p>
            </div>
          </div>

          {resetComplete ? (
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Password Updated</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Your password has been changed successfully. You can now sign in with your new credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                Proceed to Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <>
                  {/* Email */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        Account Email
                      </span>
                    </label>
                    <input
                      className={errors.email ? inputErrorClass : inputClass}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className={errorTextClass}>
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* 6-Digit OTP */}
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-slate-500" />
                          6-Digit Verification Code
                        </span>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-normal"
                        >
                          Request new code
                        </Link>
                      </span>
                    </label>
                    <div
                      className="grid grid-cols-6 gap-2 sm:gap-2.5 mt-1"
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`w-full h-12 text-center text-lg font-mono font-bold rounded-xl bg-white/[0.04] border ${
                            errors.otp
                              ? "border-rose-500/50 focus:ring-rose-500"
                              : digit
                              ? "border-indigo-500/50 bg-indigo-500/[0.05]"
                              : "border-white/[0.08]"
                          } text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                        />
                      ))}
                    </div>
                    {errors.otp && (
                      <p className={errorTextClass}>
                        <AlertCircle className="w-3 h-3" />
                        {errors.otp}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* New Password */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    New Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    className={errors.password ? `${inputErrorClass} pr-10` : `${inputClass} pr-10`}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className={errorTextClass}>
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    Confirm New Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    className={errors.confirmPassword ? `${inputErrorClass} pr-10` : `${inputClass} pr-10`}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className={errorTextClass}>
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                className="w-full mt-6 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 pt-5 border-t border-white/[0.06]">
            <Link
              to="/login"
              className="text-sm text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>

          {/* Trust badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure • Encrypted • Private</span>
          </div>
        </div>
      </div>
    </div>
  );
}
