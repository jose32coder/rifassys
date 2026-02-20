"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";

export default function MetodoPago() {
  const supabase = createClient();
  const [datos, setDatos] = useState({
    banco: "BBVA México",
    clabe: "0123 4567 8901 2345 67",
    titular: "Persona R",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAjustes() {
      try {
        const { data, error } = await supabase
          .from("configuracion")
          .select("*")
          .eq("clave", "datos_pago")
          .single();

        if (data && data.valor) {
          setDatos(data.valor);
        }
      } catch (err) {
        console.error("Error al cargar datos de pago dinámicos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAjustes();
  }, [supabase]);

  if (loading) {
    return (
      <div className="h-40 animate-pulse bg-zinc-900/50 rounded-3xl border border-zinc-800"></div>
    );
  }

  return (
    <section className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-300">
        <span className="text-emerald-500">💳</span> Datos de Transferencia
      </h2>
      <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
            Banco
          </p>
          <p className="text-lg font-semibold text-white uppercase">
            {datos.banco}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
            CLABE Interbancaria
          </p>
          <p className="text-xl font-mono text-emerald-400 font-bold select-all cursor-copy">
            {datos.clabe}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
            Titular
          </p>
          <p className="text-lg text-white uppercase">{datos.titular}</p>
        </div>
      </div>
    </section>
  );
}
