import { createClient } from "@/lib/supabase-server";
import RifaForm from "@/components/admin/RifaForm";
import { notFound } from "next/navigation";

export default async function EditarRifaPage(props) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();

  const { data: rifa, error } = await supabase
    .from("rifas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !rifa) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white mb-1">Editar Rifa</h1>
        <p className="text-zinc-500">Actualiza los detalles del sorteo "#{id.substring(0, 8)}".</p>
      </header>

      <div className="max-w-4xl">
        <RifaForm initialData={rifa} />
      </div>
    </div>
  );
}
