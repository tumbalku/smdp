"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useProfile } from "@/features/profile/hooks/useProfile";
import { PnsDetailsCard } from "@/features/profile/components/PnsDetailsCard";
import { ProfileForm } from "@/features/profile/components/ProfileForm";

export function ProfileView() {
  const {
    profile,
    loading,
    saving,
    successMsg,
    errorMsg,
    formValues,
    setFormValues,
    handleSubmit,
  } = useProfile();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Memuat data profil...</p>
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "Pegawai";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6" id="profile-page-container">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="border-green-200 bg-green-50 text-green-700">
          <CheckCircle2 className="h-4 w-4" style={{ color: "var(--jobster-success, #22c55e)" }} />
          <AlertDescription className="text-xs">{successMsg}</AlertDescription>
        </Alert>
      )}

      {profile && (
        <div className="space-y-6">
          {/* Visual Header Summary Card */}
          <Card className="shadow-xs border border-border overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-20 h-20 text-white font-extrabold text-2xl" style={{ backgroundColor: "var(--jobster-accent, #6c63ff)" }}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">{profile.name}</h2>
                <p className="text-xs font-semibold text-muted-foreground">{profile.email}</p>
                <p className="text-xs text-muted-foreground mt-2 font-bold bg-muted py-1 px-2.5 rounded-lg inline-block">
                  NIP: {profile.employeeId || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PNS Details Card */}
          <PnsDetailsCard profile={profile} />

          {/* Detailed Editable Form */}
          <ProfileForm 
            formValues={formValues} 
            setFormValues={setFormValues} 
            onSubmit={handleSubmit} 
            saving={saving} 
          />
        </div>
      )}
    </div>
  );
}
