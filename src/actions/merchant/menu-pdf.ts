"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function getMerchantRestaurantId(): Promise<{ id: string; slug: string } | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();

    let merchantId: string | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (admin.from("merchants") as any)
        .select("id")
        .eq("auth_user_id", user.id)
        .single();
      merchantId = data?.id || null;
    } catch { /* fallback */ }

    if (!merchantId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (admin.from("merchants") as any)
        .select("id")
        .eq("email", user.email || "")
        .single();
      merchantId = data?.id || null;
    }

    if (!merchantId) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("restaurants") as any)
      .select("id, slug")
      .eq("merchant_id", merchantId)
      .single();

    return data ? { id: data.id as string, slug: data.slug as string } : null;
  } catch {
    return null;
  }
}

const LOCALES = ["fr", "de", "en", "pt", "es"];

function revalidateRestaurantPages(slug: string) {
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}/restaurants/${slug}`);
  }
}

export async function uploadMenuPdf(
  formData: FormData
): Promise<{ success: boolean; error: string | null; url?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "Aucun fichier fourni" };

    if (file.type !== "application/pdf") {
      return { success: false, error: "Seuls les fichiers PDF sont acceptés" };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Le fichier est trop volumineux (10 Mo max)" };
    }

    const restaurant = await getMerchantRestaurantId();
    if (!restaurant) return { success: false, error: "Restaurant introuvable" };

    const admin = createAdminClient();

    const fileName = `${restaurant.id}/menu.pdf`;

    const { error: uploadError } = await admin.storage
      .from("restaurant-images")
      .upload(fileName, file, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("PDF upload error:", uploadError);
      return { success: false, error: "Erreur lors de l'upload du PDF" };
    }

    const { data: urlData } = admin.storage
      .from("restaurant-images")
      .getPublicUrl(fileName);

    const url = urlData.publicUrl;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (admin.from("restaurants") as any)
      .update({ menu_pdf_url: url })
      .eq("id", restaurant.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return { success: false, error: "Erreur lors de l'enregistrement de l'URL" };
    }

    revalidateRestaurantPages(restaurant.slug);
    return { success: true, error: null, url };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function deleteMenuPdf(): Promise<{ success: boolean; error: string | null }> {
  try {
    const restaurant = await getMerchantRestaurantId();
    if (!restaurant) return { success: false, error: "Restaurant introuvable" };

    const admin = createAdminClient();

    await admin.storage
      .from("restaurant-images")
      .remove([`${restaurant.id}/menu.pdf`]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurants") as any)
      .update({ menu_pdf_url: null })
      .eq("id", restaurant.id);

    if (error) return { success: false, error: "Erreur lors de la suppression" };
    revalidateRestaurantPages(restaurant.slug);
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}
