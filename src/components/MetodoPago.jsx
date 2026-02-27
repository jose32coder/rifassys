"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";

export default function MetodoPago() {
  const supabase = createClient();
  const [cuentas, setCuentas] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAjustes() {
      try {
        const { data } = await supabase
          .from("configuracion")
          .select("*")
          .eq("clave", "datos_pago")
          .single();

        if (data && data.valor) {
          // Nos aseguramos de que siempre sea un array para evitar errores
          const listaCuentas = Array.isArray(data.valor)
            ? data.valor
            : [data.valor];
          setCuentas(listaCuentas);
        }
      } catch (err) {
        console.error("Error al cargar datos de pago:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAjustes();
  }, [supabase]);

  if (loading) {
    return (
      <div className="h-64 animate-pulse bg-zinc-900/50 rounded-3xl border border-zinc-800"></div>
    );
  }

  if (cuentas.length === 0) return null;

  const cuentaActual = cuentas[activeTab];

  return (
    <section className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-300">
        <span className="text-emerald-500">💳</span> Métodos de Pago
      </h2>

      {/* Selector de Pestañas (Tabs) si hay más de una cuenta */}
      {cuentas.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {cuentas.map((cuenta, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                activeTab === idx
                  ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cuenta.tipo || "Pago"} - {cuenta.banco}
            </button>
          ))}
        </div>
      )}

      {/* Visualización de la cuenta seleccionada */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4 transition-all animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 bg-zinc-900 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
            {cuentaActual.tipo}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">
              Banco / Establecimiento
            </p>
            <p className="text-lg font-bold text-white uppercase">
              {cuentaActual.banco}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">
              {cuentaActual.tipo === "transferencia"
                ? "CLABE Interbancaria"
                : "Número de Tarjeta / Referencia"}
            </p>
            <p className="text-xl font-mono text-emerald-400 font-bold select-all cursor-copy break-all">
              {cuentaActual.clabe}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">
              Titular
            </p>
            <p className="text-lg text-white font-medium uppercase">
              {cuentaActual.titular}
            </p>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-zinc-600 text-center italic">
        Haz clic en los números para copiarlos
      </p>
    </section>
  );
}
