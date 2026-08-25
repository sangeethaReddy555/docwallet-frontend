import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import { documentService } from "../services/documentService.js";
import { validateSelectedFile } from "../utils/validators.js";
import { useToast } from "../context/ToastContext.jsx";
import { SkeletonList } from "../components/Skeleton.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import EditDocumentModal from "../components/EditDocumentModal.jsx";
import { 
  Upload, 
  LogOut, 
  FileText, 
  FolderOpen, 
  Trash2, 
  Edit2, 
  Download,
  File,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  FileCode,
  Database,
  HardDrive,
  Clock,
  Radio
} from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getFileIcon(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return FileText;
  if (['doc', 'docx'].includes(ext)) return FileText;
  if (['xls', 'xlsx'].includes(ext)) return FileSpreadsheet;
  if (['ppt', 'pptx'].includes(ext)) return File;
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return FileImage;
  if (['zip', 'rar', '7z'].includes(ext)) return FileArchive;
  if (['txt', 'csv'].includes(ext)) return FileCode;
  if (['json', 'xml'].includes(ext)) return Database;
  return File;
}

function getFileColor(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return 'text-red-400 bg-red-500/10 border-red-400/20';
  if (['doc', 'docx'].includes(ext)) return 'text-blue-400 bg-blue-500/10 border-blue-400/20';
  if (['xls', 'xlsx'].includes(ext)) return 'text-green-400 bg-green-500/10 border-green-400/20';
  if (['ppt', 'pptx'].includes(ext)) return 'text-orange-400 bg-orange-500/10 border-orange-400/20';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'text-purple-400 bg-purple-500/10 border-purple-400/20';
  if (['zip', 'rar'].includes(ext)) return 'text-yellow-400 bg-yellow-500/10 border-yellow-400/20';
  if (['txt'].includes(ext)) return 'text-gray-400 bg-white/5 border-white/10';
  if (['csv'].includes(ext)) return 'text-teal-400 bg-teal-500/10 border-teal-400/20';
  return 'text-indigo-400 bg-indigo-500/10 border-indigo-400/20';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const data = await documentService.list();
      setDocuments(data.documents);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingDocs(false);
    }
  }, [toast]);

  useEffect(() => {
    (async () => {
      try {
        const data = await authService.getCurrentUser();
        if (data.user.status !== "approved") {
          navigate("/login");
          return;
        }
        setUser(data.user);
        setLoadingPage(false);
        await loadDocuments();
      } catch (err) {
        navigate("/login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    const validationError = validateSelectedFile(selected);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const validationError = validateSelectedFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    try {
      await documentService.upload(file);
      toast.success("File uploaded successfully");
      setFile(null);
      document.getElementById("fileInput").value = "";
      await loadDocuments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await documentService.remove(deleteTarget._id);
      toast.success("Document deleted");
      setDeleteTarget(null);
      await loadDocuments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveRename = async (newName) => {
    if (!editTarget) return;
    try {
      await documentService.rename(editTarget._id, newName);
      toast.success("Document renamed");
      setEditTarget(null);
      await loadDocuments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore — we're navigating away regardless
    }
    navigate("/login");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileAccess = async (doc, isDownload = false) => {
    try {
      const blob = await documentService.fetchFile(doc._id, isDownload);
      const objectUrl = URL.createObjectURL(blob);
      if (isDownload) {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = doc.originalName || "document";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      } else {
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      }
    } catch (err) {
      toast.error(err.message || "Failed to access document");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    const validationError = validateSelectedFile(droppedFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setFile(droppedFile);
    document.getElementById("fileInput").files = e.dataTransfer.files;
  };

  // ---- Shared page shell: ambient dark background ----
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
              <FolderOpen className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Document Wallet</h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  Active
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">Welcome back, {user?.name}</p>
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
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400/70" />
            <div className="flex items-center justify-between pl-2">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Files</p>
                <p className="text-2xl font-bold text-white font-mono tabular-nums">
                  {loadingDocs ? "—" : documents.length}
                </p>
              </div>
              <div className="p-2 bg-indigo-400/10 rounded-lg">
                <File className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </div>
          <div className="relative bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400/70" />
            <div className="flex items-center justify-between pl-2">
              <div>
                <p className="text-sm text-slate-400 font-medium">Storage Used</p>
                <p className="text-2xl font-bold text-white font-mono tabular-nums">
                  {loadingDocs ? "—" : formatBytes(documents.reduce((acc, doc) => acc + doc.size, 0))}
                </p>
              </div>
              <div className="p-2 bg-emerald-400/10 rounded-lg">
                <HardDrive className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="relative bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400/70" />
            <div className="flex items-center justify-between pl-2">
              <div>
                <p className="text-sm text-slate-400 font-medium">Recent Upload</p>
                <p className="text-xl font-bold text-white font-mono truncate max-w-[120px]">
                  {loadingDocs ? "—" : documents.length > 0 ? documents[0]?.originalName?.slice(0, 14) + '...' : 'None'}
                </p>
              </div>
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white tracking-tight">Upload Document</h2>
            <span className="ml-auto text-xs text-slate-500 font-mono">Max 20MB</span>
          </div>

          <form onSubmit={handleUpload}>
            <div
              className={`relative border-2 border-dashed rounded-xl p-5 sm:p-6 transition-all duration-200 ${
                dragOver 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : file 
                    ? 'border-emerald-400 bg-emerald-500/10' 
                    : 'border-white/[0.08] hover:border-indigo-400/40 bg-white/[0.02]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="fileInput"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.json,.xml"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              <div className="text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-400/20">
                      <FileText className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-200">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="inline-flex p-4 bg-indigo-500/10 rounded-xl border border-indigo-400/20 mb-3">
                      <Upload className="w-7 h-7 text-indigo-400" />
                    </div>
                    <p className="text-sm text-slate-300 font-medium">
                      Drag & drop your file here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      or click to browse (PDF, Word, Excel, PPT, TXT, CSV, ZIP)
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              className={`mt-4 w-full px-6 py-3 rounded-xl text-sm text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                !file || uploading
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/[0.06]'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transform hover:scale-[1.02]'
              }`}
              type="submit"
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white tracking-tight">Your Documents</h2>
            {!loadingDocs && documents.length > 0 && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 px-2.5 py-1 rounded-full font-medium">
                <Radio className="w-3 h-3" />
                {documents.length} files
              </span>
            )}
          </div>

          {loadingDocs ? (
            <div className="space-y-3">
              <SkeletonList rows={4} />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-14 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.08]">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-indigo-400/10 rounded-full border border-indigo-400/20">
                  <FolderOpen className="w-7 h-7 text-indigo-400" />
                </div>
              </div>
              <p className="text-slate-200 font-medium">No documents uploaded yet</p>
              <p className="text-slate-500 text-sm mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.015]">
              {documents.map((doc, i) => {
                const FileIcon = getFileIcon(doc.originalName);
                const fileColor = getFileColor(doc.originalName);
                
                return (
                  <li
                    key={doc._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white/[0.03] transition-colors duration-150 gap-3 opacity-0 animate-fadeInDown"
                    style={{ animationDelay: `${i * 70}ms`, animationFillMode: "forwards" }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl border ${fileColor} flex-shrink-0`}>
                        <FileIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => handleFileAccess(doc, false)}
                          className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline truncate block text-sm transition-colors text-left"
                        >
                          {doc.originalName}
                        </button>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{formatBytes(doc.size)}</span>
                          <span className="w-0.5 h-0.5 bg-slate-600 rounded-full" />
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          <span className="w-0.5 h-0.5 bg-slate-600 rounded-full" />
                          <span className="uppercase">{doc.originalName?.split('.').pop()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 shrink-0 ml-12 sm:ml-0">
                      <button
                        type="button"
                        onClick={() => handleFileAccess(doc, true)}
                        className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/[0.06] transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/[0.06] transition-colors"
                        onClick={() => setEditTarget(doc)}
                        title="Rename"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-400/20 transition-colors"
                        onClick={() => setDeleteTarget(doc)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.originalName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <EditDocumentModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveRename}
        initialName={editTarget?.originalName}
      />
    </Shell>
  );
}