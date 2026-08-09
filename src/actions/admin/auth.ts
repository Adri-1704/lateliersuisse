"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";

export async function loginAdmin(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: "Email ou mot de passe incorrect" };
  }

  // Pose un cookie lisible côté JS pour que PageViewTracker ignore les visites admin
  const cookieStore = await cookies();
  cookieStore.set("jt_admin", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });

  return { success: true, error: null };
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete("jt_admin");
  redirect("/admin/login");
}

export async function updateAdminPassword(newPassword: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export async function getAdminUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Garde d'autorisation pour les Server Actions admin.
 *
 * Récupère l'utilisateur authentifié via getAdminUser(), vérifie qu'il est
 * bien admin via isAdminUser() (whitelist ADMIN_EMAILS ou profiles.is_admin),
 * et lève une erreur sinon. À appeler en première ligne de toute Server
 * Action admin qui mute ou lit des données sensibles.
 *
 * @throws {Error} si l'utilisateur n'est pas authentifié ou n'est pas admin.
 * @returns L'utilisateur Supabase authentifié (garanti admin).
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    throw new Error("Non autorisé : authentification requise");
  }
  const admin = await isAdminUser(user.id, user.email || "");
  if (!admin) {
    throw new Error("Non autorisé : privilèges administrateur requis");
  }
  return user;
}
