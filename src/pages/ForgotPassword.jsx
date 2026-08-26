import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import { validateForgotPasswordForm } from "../utils/validators.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Edit2,
} from "lucide-react";

const inputClass =
  "w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200";
const inputErrorClass =
  "w-full px-4 py-3 bg-white/[0.04] border border-rose-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200";
const labelClass = "block mb-1.5 text-sm font-semibold text-slate-300";
const errorTextClass = "mt-1.5 text-xs text-rose-400 flex items-center gap-1.5";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();

  // Step: "EMAIL" | "VERIFY_AND_RESET" | "SUCCESS"
  const [step, setStep] = useState("EMAIL");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // 6-digit OTP state (array of 6 strings)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);

  // Password fields
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [formErrors, setFormErrors] = useState({ otp: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Resend countdown timer
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Step 1: Request 6-digit code
  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    setEmailError("");

    const error = validateForgotPasswordForm({ email });
    if (error) {
      setEmailError(error);
      return;
    }

    setSendingEmail(true);
    try {
      await authService.forgotPassword({ email });
      toast.success("6-digit verification code sent to your email!");
      setStep("VERIFY_AND_RESET");
      setResendCountdown(30); // 30 seconds cooldown
      // Focus first OTP box
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.message || "Failed to send verification code");
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle individual OTP digit input
  const handleOtpChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otp];

    if (cleaned.length > 1) {
      // User pasted multiple characters
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

    if (formErrors.otp) {
      setFormErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  // Handle Backspace on OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste anywhere on the OTP container
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
    if (formErrors.otp) {
      setFormErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  // Step 2: Verify Code and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");
    const errors = { otp: "", password: "", confirmPassword: "" };
    let hasError = false;

    if (!otpCode || otpCode.length !== 6) {
      errors.otp = "Please enter the complete 6-digit verification code";
      hasError = true;
    }

    if (!form.password) {
      errors.password = "Password is required";
      hasError = true;
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      hasError = true;
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword({
        email,
        otp: otpCode,
        password: form.password,
      });
      toast.success("Password reset successfully!");
      setStep("SUCCESS");
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
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

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8 border border-white/[0.06] animate-fadeInDown">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-400/20">
              {step === "SUCCESS" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <KeyRound className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {step === "EMAIL" && "Forgot Password"}
                {step === "VERIFY_AND_RESET" && "Reset Password"}
                {step === "SUCCESS" && "Password Reset"}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {step === "EMAIL" && "Enter your email to receive a 6-digit code"}
                {step === "VERIFY_AND_RESET" && "Enter the 6-digit code & new password"}
                {step === "SUCCESS" && "Your credentials have been updated"}
              </p>
            </div>
          </div>

          {/* STEP 1: Enter Email */}
          {step === "EMAIL" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    Account Email
                  </span>
                </label>
                <input
                  className={emailError ? inputErrorClass : inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="you@example.com"
                  autoFocus
                />
                {emailError && (
                  <p className={errorTextClass}>
                    <AlertCircle className="w-3 h-3" />
                    {emailError}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                We will send a 6-digit verification code to this email to confirm your identity and reset your password.
              </p>

              <button
                className="w-full mt-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                type="submit"
                disabled={sendingEmail}
              >
                {sendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending 6-digit code...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send 6-Digit Code
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-white/[0.06]">
                <Link
                  to="/login"
                  className="text-sm text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Enter 6-digit Code & New Password */}
          {step === "VERIFY_AND_RESET" && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
              {/* Target Email badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  Code sent to <strong className="text-indigo-200">{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 ml-2 flex-shrink-0"
                >
                  <Edit2 className="w-3 h-3" />
                  Change
                </button>
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      6-Digit Verification Code
                    </span>
                    <button
                      type="button"
                      disabled={resendCountdown > 0 || sendingEmail}
                      onClick={() => handleSendCode()}
                      className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 disabled:cursor-not-allowed font-normal"
                    >
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                    </button>
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
                        formErrors.otp
                          ? "border-rose-500/50 focus:ring-rose-500"
                          : digit
                          ? "border-indigo-500/50 bg-indigo-500/[0.05]"
                          : "border-white/[0.08]"
                      } text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                    />
                  ))}
                </div>
                {formErrors.otp && (
                  <p className={errorTextClass}>
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.otp}
                  </p>
                )}
              </div>

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
                    className={formErrors.password ? `${inputErrorClass} pr-10` : `${inputClass} pr-10`}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handlePasswordChange}
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
                {formErrors.password && (
                  <p className={errorTextClass}>
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    Confirm New Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    className={formErrors.confirmPassword ? `${inputErrorClass} pr-10` : `${inputClass} pr-10`}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handlePasswordChange}
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
                {formErrors.confirmPassword && (
                  <p className={errorTextClass}>
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                className="w-full mt-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying & Updating...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-white/[0.06] text-center">
                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to email step
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Screen */}
          {step === "SUCCESS" && (
            <div className="text-center py-4 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Password Reset Successfully!</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Your password has been changed. You can now log in to Document Wallet with your new credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              >
                Proceed to Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Trust badge */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure • Encrypted • Private</span>
          </div>
        </div>
      </div>
    </div>
  );
}
