import type { DbMenuItem } from "@/lib/supabase/types";

const CATEGORY_LABELS: Record<string, string> = {
  entrees: "Entrées",
  plats: "Plats",
  desserts: "Desserts",
  boissons: "Boissons",
  vins: "Vins",
  menus: "Menus",
  fromages: "Fromages",
  aperitifs: "Apéritifs",
  specialites: "Spécialités",
};

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat.toLowerCase()] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
}

export async function generateMenuPdfBlob(
  items: DbMenuItem[],
  restaurantName: string,
  locale: string = "fr"
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const nameKey = `name_${locale}` as keyof DbMenuItem;
  const descKey = `description_${locale}` as keyof DbMenuItem;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const usable = W - margin * 2;

  // ── Header ──────────────────────────────────────────────────────
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, W, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(restaurantName, W / 2, 18, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("just-tag.app", W / 2, 26, { align: "center" });

  // Accent bar
  doc.setFillColor(232, 93, 38);
  doc.rect(margin, 32, usable, 1.5, "F");

  let y = 46;

  // ── Group by category ────────────────────────────────────────────
  const available = items.filter((i) => i.is_available);
  const categoryOrder = [...new Set(available.map((i) => i.category))].sort();

  for (const cat of categoryOrder) {
    const catItems = available
      .filter((i) => i.category === cat)
      .sort((a, b) => a.position - b.position);

    if (catItems.length === 0) continue;

    // Category header
    doc.setFillColor(15, 17, 23);
    doc.rect(margin, y, usable, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(categoryLabel(cat).toUpperCase(), margin + 4, y + 5);
    y += 10;

    // Items table
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [],
      body: catItems.map((item) => {
        const name = (item[nameKey] as string | null) || item.name_fr;
        const desc = (item[descKey] as string | null) || item.description_fr || "";
        return [name + (desc ? `\n${desc}` : ""), `CHF ${Number(item.price).toFixed(2)}`];
      }),
      columnStyles: {
        0: { cellWidth: usable * 0.78, fontSize: 9 },
        1: { cellWidth: usable * 0.22, halign: "right", fontStyle: "bold", fontSize: 9, textColor: [232, 93, 38] },
      },
      styles: {
        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        lineColor: [235, 235, 235],
        lineWidth: 0.2,
        textColor: [30, 30, 30],
        font: "helvetica",
        overflow: "linebreak",
      },
      alternateRowStyles: { fillColor: [250, 250, 248] },
      didParseCell(data) {
        if (data.column.index === 0 && data.row.raw) {
          const text = String((data.row.raw as string[])[0]);
          const lines = text.split("\n");
          if (lines.length > 1) {
            data.cell.styles.fontStyle = "normal";
          }
        }
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  }

  // ── Footer ───────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Prix en CHF, TVA incluse · just-tag.app",
      W / 2,
      297 - 8,
      { align: "center" }
    );
  }

  return doc.output("blob");
}
