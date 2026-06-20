import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound, Lock, AlertCircle, EyeOff, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User } from "../types";

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  targetUser: User | null;
  error: string;
  onSubmit: (password: string) => void;
}

export function ResetPasswordModal({
  open,
  onOpenChange,
  loading,
  targetUser,
  error: parentError,
  onSubmit,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  // ponytail: reset input states when dialog opens
  useEffect(() => {
    if (open) {
      setNewPassword("");
      setConfirmPassword("");
      setShowNew(false);
      setShowConfirm(false);
      setLocalError("");
    }
  }, [open]);

  if (!targetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (newPassword.length < 6) {
      setLocalError("Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Konfirmasi password tidak cocok.");
      return;
    }
    onSubmit(newPassword);
  };

  const displayError = localError || parentError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            Ubah Kata Sandi Pegawai
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target user info */}
          <div className="bg-muted rounded-xl p-3 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Pegawai yang ditargetkan</p>
            <p className="text-sm font-extrabold text-foreground mt-0.5">{targetUser.name}</p>
            <p className="text-xs text-muted-foreground">{targetUser.email}</p>
            {targetUser.employeeId && (
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">NIP: {targetUser.employeeId}</p>
            )}
          </div>

          {/* Warning note */}
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Tindakan ini akan langsung mengganti password pegawai. Pegawai perlu diberitahu password barunya secara manual.
            </p>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="pwNew" className="text-xs font-bold text-muted-foreground">Password Baru *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="pwNew"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="pl-9 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="pwConfirm" className="text-xs font-bold text-muted-foreground">Konfirmasi Password Baru *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="pwConfirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="pl-9 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password strength hint */}
          {newPassword.length > 0 && (
            <div className="flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full transition-all ${
                newPassword.length < 6 ? "bg-red-400" :
                newPassword.length < 8 ? "bg-amber-400" :
                newPassword.length < 12 ? "bg-yellow-400" : "bg-green-500"
              }`} />
              <span className={`text-[10px] font-bold ${
                newPassword.length < 6 ? "text-red-500" :
                newPassword.length < 8 ? "text-amber-500" :
                newPassword.length < 12 ? "text-yellow-600" : "text-green-600"
              }`}>
                {newPassword.length < 6 ? "Terlalu pendek" :
                 newPassword.length < 8 ? "Lemah" :
                 newPassword.length < 12 ? "Cukup" : "Kuat"}
              </span>
            </div>
          )}

          {/* Match indicator */}
          {confirmPassword.length > 0 && (
            <p className={`text-[11px] font-semibold ${
              newPassword === confirmPassword ? "text-green-600" : "text-red-500"
            }`}>
              {newPassword === confirmPassword ? "✓ Password cocok" : "✗ Password tidak cocok"}
            </p>
          )}

          {/* Error */}
          {displayError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-semibold">{displayError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Ubah Password
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
