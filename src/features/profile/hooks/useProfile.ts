/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { UserProfile } from "../types";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ponytail: group form fields state into a single object
  const [formValues, setFormValues] = useState({
    namaLahir: "",
    alamatLengkap: "",
    nomorTelepon: "",
    gelarAkademik: "",
    gender: "L",
    birthDate: "",
    agama: "",
    pendidikanTerakhir: "",
    statusPernikahan: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/profile");
      const resData = await res.json();
      if (resData.data) {
        const p: UserProfile = resData.data;
        setProfile(p);
        setFormValues({
          namaLahir: p.namaLahir || "",
          alamatLengkap: p.alamatLengkap || "",
          nomorTelepon: p.nomorTelepon || "",
          gelarAkademik: p.gelarAkademik || "",
          gender: p.gender || "L",
          birthDate: p.birthDate ? p.birthDate.split("T")[0] : "",
          agama: p.agama || "",
          pendidikanTerakhir: p.pendidikanTerakhir || "",
          statusPernikahan: p.statusPernikahan || "",
        });
      } else {
        throw new Error(resData.error?.message || "Gagal mengambil data profil.");
      }
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setErrorMsg(error.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLahir: formValues.namaLahir,
          alamatLengkap: formValues.alamatLengkap,
          nomorTelepon: formValues.nomorTelepon,
          gelarAkademik: formValues.gelarAkademik,
          gender: formValues.gender,
          birthDate: formValues.birthDate || null,
          agama: formValues.agama || null,
          pendidikanTerakhir: formValues.pendidikanTerakhir || null,
          statusPernikahan: formValues.statusPernikahan || null,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal memperbarui profil.");
      }

      setSuccessMsg("Profil Anda berhasil diperbarui.");
      
      // ponytail: direct update to avoid redundant API request
      if (resData.data) {
        const p: UserProfile = resData.data;
        setProfile(p);
        setFormValues({
          namaLahir: p.namaLahir || "",
          alamatLengkap: p.alamatLengkap || "",
          nomorTelepon: p.nomorTelepon || "",
          gelarAkademik: p.gelarAkademik || "",
          gender: p.gender || "L",
          birthDate: p.birthDate ? p.birthDate.split("T")[0] : "",
          agama: p.agama || "",
          pendidikanTerakhir: p.pendidikanTerakhir || "",
          statusPernikahan: p.statusPernikahan || "",
        });
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    successMsg,
    errorMsg,
    formValues,
    setFormValues,
    handleSubmit,
  };
}
