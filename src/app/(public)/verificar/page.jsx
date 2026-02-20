"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-client";
import { useSearchParams } from "next/navigation";

function VerificarPageContent() {
  const searchParams = useSearchParams();
  const initialRifaId = searchParams.get("rifaId") || "";

  const supabase = createClient();
  const [telefono, setTelefono] = useState("");
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const handleVerificar = async (e) => {
    e.preventDefault();
    if (!telefono) return;

    setLoading(true);
    setBuscado(true);

    const { data, error } = await supabase
      .from("boletos")
      .select("*, rifas!inner(nombre, estado)")
      .eq("comprador_telefono", telefono)
      .eq("rifas.estado", "activa") // Solo mostrar tickets de rifas activas
      .order("created_at", { ascending: false });

    if (!error) {
      setBoletos(data || []);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-20 px-6">
      <div className="max-w-xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">
            Verificador de Boletos
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Ingresa tu teléfono de WhatsApp para ver el estado de tus boletos.
          </p>
        </header>

        <form
          onSubmit={handleVerificar}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              WhatsApp / Teléfono
            </label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
              placeholder="5512345678"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-4 rounded-2xl hover:opacity-90 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Buscando..." : "Consultar mis Boletos"}
          </button>
        </form>

        {buscado && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center">
              Resultados de Búsqueda
            </h2>

            {boletos.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 rounded-3xl text-center text-zinc-500">
                No se encontraron boletos registrados con este número.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {boletos.map((boleto) => (
                  <div
                    key={boleto.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-black text-zinc-900 dark:text-white uppercase">
                          {boleto.rifas?.nombre}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                          Folio: {boleto.folio}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          boleto.estado === "pagado"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : boleto.estado === "pendiente"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {boleto.estado}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎫</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          {boleto.numero_boleto}
                        </span>
                      </div>
                      {boleto.estado === "pendiente" && (
                        <p className="text-[10px] text-orange-500 font-bold uppercase animate-pulse">
                          Pendiente de validación
                        </p>
                      )}
                      {boleto.estado === "pagado" && (
                        <p className="text-[10px] text-emerald-500 font-bold uppercase">
                          ✓ Validado
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerificarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-emerald-500 font-black animate-pulse uppercase tracking-widest text-xs">
            Cargando verificador...
          </div>
        </div>
      }
    >
      <VerificarPageContent />
    </Suspense>
  );
}
