// Frontend validation — catches obvious mistakes instantly, before a
// network call is even made. The backend re-validates everything again
// regardless (never trust the client), so these two layers intentionally
// mirror each other's rules.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_FILE_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "zip", "rar", "7z", "json", "xml",
];

export function validateRegisterForm({ name, email, password }) {
  if (!name || !name.trim() || name.trim().length < 2) return "Name must be at least 2 characters";
  if (!email || !EMAIL_REGEX.test(email)) return "Please enter a valid email address";
  if (!password || password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export function validateLoginForm({ email, password }) {
  if (!email || !EMAIL_REGEX.test(email)) return "Please enter a valid email address";
  if (!password) return "Password is required";
  return null;
}

export function validateForgotPasswordForm({ email }) {
  if (!email || !EMAIL_REGEX.test(email)) return "Please enter a valid email address";
  return null;
}

export function validateResetPasswordForm({ otp, password, confirmPassword }) {
  if (otp !== undefined && (!otp || !/^\d{6}$/.test(otp.trim()))) {
    return "Please enter a valid 6-digit verification code";
  }
  if (!password || password.length < 6) return "Password must be at least 6 characters";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}

export function validateRenameForm(newName) {
  if (!newName || !newName.trim()) return "Name cannot be empty";
  if (newName.trim().length > 150) return "Name is too long (max 150 characters)";
  return null;
}

export function validateSelectedFile(file, remainingBytes) {
  if (!file) return "Please choose a file";
  if (file.type && file.type.startsWith("image/")) {
    return "Images are not allowed. Please choose a document file (PDF, Word, Excel, etc.)";
  }
  const extension = file.name?.split(".").pop()?.toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) return "This file type is not supported";
  if (file.size > 10 * 1024 * 1024) return "File is too large (max 10MB per file)";
  if (remainingBytes !== undefined && file.size > remainingBytes) {
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    const remMB = (remainingBytes / (1024 * 1024)).toFixed(1);
    return `Not enough storage remaining. File is ${fileMB}MB but only ${remMB}MB available in your quota.`;
  }
  return null;
}
