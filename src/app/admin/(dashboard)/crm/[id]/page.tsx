import { notFound } from "next/navigation";
import { getProspectById } from "@/actions/prospects";
import { ProspectForm } from "../ProspectForm";

export const dynamic = "force-dynamic";

export default async function EditProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prospect = await getProspectById(id);
  if (!prospect) notFound();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Modifier le prospect</h1>
      <ProspectForm prospect={prospect} />
    </div>
  );
}
