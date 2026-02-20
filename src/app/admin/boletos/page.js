import { createClient } from "@/lib/supabase-server";
import BoletoTable from "@/components/admin/BoletoTable";

export default async function BoletosAdminPage() {
  const supabase = await createClient();

  const { data: boletos } = await supabase
    .from("boletos")
    .select("*, rifas(nombre, estado)")
    .order("created_at", { ascending: false });

  const { data: rifas } = await supabase
    .from("rifas")
    .select("id, nombre")
    .order("nombre");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white mb-1">Boletos</h1>
        <p className="text-zinc-500">
          Gestiona las reservas y valida los pagos de los clientes.
        </p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <BoletoTable initialData={boletos || []} rifasList={rifas || []} />
      </div>
    </div>
  );
}
