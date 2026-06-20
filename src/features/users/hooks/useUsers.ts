/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { User, EmploymentStatusOption, ProfessionGroupOption, UserFormData } from "../types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [stats, setStats] = useState<{
    statusGenderStats: { name: string; value: number }[];
    positionStats: { name: string; count: number }[];
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Master Kepegawaian states
  const [employmentStatuses, setEmploymentStatuses] = useState<EmploymentStatusOption[]>([]);
  const [professionGroups, setProfessionGroups] = useState<ProfessionGroupOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // ponytail: merge modal and reset password form states into one unified object
  const [modalState, setModalState] = useState({
    createOpen: false,
    createLoading: false,
    editOpen: false,
    editLoading: false,
    selectedUser: null as User | null,
    pwOpen: false,
    pwLoading: false,
    pwTargetUser: null as User | null,
    pwError: "",
  });

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/admin/employment-categories");
      const resData = await res.json();
      if (res.ok && resData.success && resData.data) {
        setEmploymentStatuses(resData.data.employmentStatuses || []);
        setProfessionGroups(resData.data.professionGroups || []);
      }
    } catch (err) {
      console.error("Gagal memuat kategori kepegawaian:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const resData = await res.json();
      if (res.ok && resData.data) {
        setStats({
          statusGenderStats: resData.data.statusGenderStats || [],
          positionStats: resData.data.positionStats || [],
        });
      }
    } catch (err) {
      console.error("Gagal memuat statistik pegawai:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("pageSize", "10");
      if (search) params.append("search", search);
      if (roleFilter !== "ALL") params.append("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const resData = await res.json();

      if (res.ok) {
        setUsers(resData.users || []);
        setTotal(resData.total || 0);
        setTotalPages(resData.totalPages || 1);
      } else {
        throw new Error(resData.error?.message || "Gagal mengambil data pegawai.");
      }

      fetchStats();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, fetchStats]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (formData: UserFormData) => {
    setErrorMsg("");
    setSuccessMsg("");
    setModalState((p) => ({ ...p, createLoading: true }));
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal menambahkan pegawai.");
      }

      setSuccessMsg(`Pegawai "${formData.name}" berhasil didaftarkan.`);
      setModalState((p) => ({ ...p, createOpen: false }));
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mendaftarkan pegawai.");
    } finally {
      setModalState((p) => ({ ...p, createLoading: false }));
    }
  };

  const handleOpenEditRoles = (user: User) => {
    setModalState((p) => ({ ...p, selectedUser: user, editOpen: true }));
  };

  const handleUpdateUser = async (formData: UserFormData) => {
    if (!modalState.selectedUser) return;
    setErrorMsg("");
    setSuccessMsg("");
    setModalState((p) => ({ ...p, editLoading: true }));
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: modalState.selectedUser.id,
          ...formData,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error?.message || "Gagal memperbarui pegawai.");
      }

      setSuccessMsg(`Informasi pegawai "${formData.name}" berhasil diperbarui.`);
      setModalState((p) => ({ ...p, editOpen: false, selectedUser: null }));
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui data pegawai.");
    } finally {
      setModalState((p) => ({ ...p, editLoading: false }));
    }
  };

  const handleOpenChangePw = (user: User) => {
    setModalState((p) => ({
      ...p,
      pwTargetUser: user,
      pwError: "",
      pwOpen: true,
      pwLoading: false,
    }));
  };

  const handleChangePassword = async (password: string) => {
    if (!modalState.pwTargetUser) return;
    setModalState((p) => ({ ...p, pwError: "", pwLoading: true }));

    try {
      const res = await fetch(`/api/admin/users/${modalState.pwTargetUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error?.message || "Gagal mengubah password.");

      const successMessage = resData.data?.message || `Password berhasil diubah.`;
      setModalState((p) => ({ ...p, pwOpen: false, pwTargetUser: null, pwLoading: false }));
      setTimeout(() => setSuccessMsg(successMessage), 300);
    } catch (err: any) {
      setModalState((p) => ({ ...p, pwError: err.message || "Gagal mengubah password.", pwLoading: false }));
    }
  };

  return {
    users,
    total,
    totalPages,
    loading,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    stats,
    statsLoading,
    employmentStatuses,
    professionGroups,
    categoriesLoading,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    fetchUsers,
    fetchCategories,

    // Create states & actions
    createOpen: modalState.createOpen,
    setCreateOpen: (open: boolean) => setModalState((p) => ({ ...p, createOpen: open })),
    createLoading: modalState.createLoading,
    handleCreateUser,

    // Edit states & actions
    editOpen: modalState.editOpen,
    setEditOpen: (open: boolean) => setModalState((p) => ({ ...p, editOpen: open })),
    editLoading: modalState.editLoading,
    selectedUser: modalState.selectedUser,
    handleOpenEditRoles,
    handleUpdateUser,

    // Change password states & actions
    pwOpen: modalState.pwOpen,
    setPwOpen: (open: boolean) => setModalState((p) => ({ ...p, pwOpen: open })),
    pwLoading: modalState.pwLoading,
    pwTargetUser: modalState.pwTargetUser,
    pwError: modalState.pwError,
    handleOpenChangePw,
    handleChangePassword,
  };
}
