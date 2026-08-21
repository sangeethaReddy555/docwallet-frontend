import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import { adminService } from "../services/adminService.js";
import { useToast } from "../context/ToastContext.jsx";
import { SkeletonList } from "../components/Skeleton.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { UserPlus, LogOut, CheckCircle, XCircle, Users, Shield, Clock, Radio } from "lucide-react";

export default function AdminPanel() {
  const navigate = useNavigate();
  const toast = useToast();

  const [admin, setAdmin] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await adminService.getUserStats();
      setTotalUsers(data.totalUsers);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingStats(false);
    }
  }, [toast]);

  const loadPending = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getPendingUsers();
      setPendingUsers(data.users);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    (async () => {
      try {
        const data = await authService.getCurrentUser();
        if (data.user.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setAdmin(data.user);
        setLoadingPage(false);
        await Promise.all([loadPending(), loadStats()]);
      } catch (err) {
        navigate("/login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleApprove = async (userId) => {
    setProcessingId(userId);
    try {
      await adminService.reviewUser(userId, "approve");
      toast.success("User approved successfully");
      await Promise.all([loadPending(), loadStats()]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setProcessingId(rejectTarget._id);
    try {
      await adminService.reviewUser(rejectTarget._id, "reject");
      toast.success("User rejected");
      setRejectTarget(null);
      await Promise.all([loadPending(), loadStats()]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    }
    navigate("/login");
  };

  // ---- Shared page shell: ambient dark background used for both loading and loaded states ----
  const Shell = ({ children }) => (
    <div className="relative min-h-screen bg-[#0A0E16] text-slate-100 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <div className="relative z-10 flex items-start justify-center p-4 py-8 sm:py-14">
        <div className="w-full max-w-3xl">{children}</div>
      </div>
    </div>
  );

  if (loadingPage) {
    return (
      <Shell>
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8 border border-white/[0.06]">
          <div className="skeleton h-8 w-48 mb-6 rounded-lg bg-white/10" />
          <div className="space-y-4">
            <SkeletonList rows={3} />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-5 sm:p-8 animate-fadeInDown border border-white/[0.06]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-400/20">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Admin Panel</h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">Welcome back, {admin?.name}</p>
            </div>
          </div>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] text-slate-300 text-sm font-semibold border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400/70" />
            <div className="flex items-center justify-between pl-2">
              <div>
                <p className="text-sm text-slate-400 font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold text-white font-mono tabular-nums">
                  {loadingUsers ? "—" : pendingUsers.length}
                </p>
              </div>
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
          <div className="relative bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400/70" />
            <div className="flex items-center justify-between pl-2">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white font-mono tabular-nums">
                  {loadingStats ? "—" : totalUsers}
                </p>
              </div>
              <div className="p-2 bg-emerald-400/10 rounded-lg">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Users Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white tracking-tight">Pending Approvals</h2>
            {!loadingUsers && pendingUsers.length > 0 && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 px-2.5 py-1 rounded-full font-medium">
                <Radio className="w-3 h-3" />
                {pendingUsers.length} waiting
              </span>
            )}
          </div>

          {loadingUsers ? (
            <div className="space-y-3">
              <SkeletonList rows={4} />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-14 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.08]">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-emerald-400/10 rounded-full border border-emerald-400/20">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <p className="text-slate-200 font-medium">All caught up</p>
              <p className="text-slate-500 text-sm mt-1">No users waiting for approval right now</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.015]">
              {pendingUsers.map((u, i) => (
                <li
                  key={u._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white/[0.03] transition-colors duration-150 gap-3 opacity-0 animate-fadeInDown"
                  style={{ animationDelay: `${i * 70}ms`, animationFillMode: "forwards" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ring-2 ring-white/[0.08]">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <strong className="font-semibold text-slate-100">{u.name}</strong>
                        <div className="text-xs text-slate-500 font-mono truncate">{u.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-11 sm:ml-0">
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-all duration-200 shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleApprove(u._id)}
                      disabled={processingId === u._id}
                    >
                      {processingId === u._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] text-rose-400 border border-rose-400/20 text-sm font-semibold hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setRejectTarget(u)}
                      disabled={processingId === u._id}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
        title="Reject User"
        message={`Are you sure you want to reject "${rejectTarget?.name}"? They will not be able to log in.`}
        confirmLabel="Reject"
        confirmVariant="danger"
      />
    </Shell>
  );
}