"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { Plus, Trash2, Landmark, CreditCard } from "lucide-react"; // Opcional: para iconos

export default function AjustesPagoPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // Ahora es un array de cuentas
  const [cuentas, setCuentas] = useState([
    {
      id: Date.now(),
      tipo: "transferencia",
      banco: "",
      clabe: "",
      titular: "",
    },
  ]);

  useEffect(() => {
    async function fetchAjustes() {
      const { data } = await supabase
        .from("configuracion")
        .select("*")
        .eq("clave", "datos_pago")
        .single();

      if (data && Array.isArray(data.valor)) {
        setCuentas(data.valor);
      } else if (data && data.valor.banco) {
        // Migración: Si tenías una sola cuenta antes, la convertimos a array
        setCuentas([{ ...data.valor, id: Date.now(), tipo: "transferencia" }]);
      }
      setLoading(false);
    }
    fetchAjustes();
  }, [supabase]);

  const agregarCuenta = () => {
    setCuentas([
      ...cuentas,
      { id: Date.now(), tipo: "deposito", banco: "", clabe: "", titular: "" },
    ]);
  };

  const eliminarCuenta = (id) => {
    if (cuentas.length === 1) return; // Mantener al menos una
    setCuentas(cuentas.filter((c) => c.id !== id));
  };

  const handleChange = (id, field, value) => {
    setCuentas(
      cuentas.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const { error } = await supabase
      .from("configuracion")
      .upsert({ clave: "datos_pago", valor: cuentas }, { onConflict: "clave" });

    if (!error) {
      await supabase.from("actividades").insert([
        {
          tipo: "ajuste",
          descripcion: `Cuentas de pago actualizadas (${cuentas.length})`,
          metadata: { total_cuentas: cuentas.length },
        },
      ]);
      setStatus({
        type: "success",
        message: "Cuentas guardadas correctamente.",
      });
    } else {
      setStatus({ type: "error", message: "Error: " + error.message });
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="py-20 text-center animate-pulse text-emerald-500">
        Cargando configuración...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white mb-1">
            Cuentas de Pago
          </h1>
          <p className="text-zinc-500">
            Configura múltiples métodos para que tus clientes paguen.
          </p>
        </div>
        <button
          onClick={agregarCuenta}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-3 rounded-2xl transition-all font-bold text-sm border border-zinc-700"
        >
          <Plus size={18} /> Agregar Cuenta
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {status && (
          <div
            className={`p-4 rounded-2xl text-sm font-bold border ${status.type === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
          >
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {cuentas.map((cuenta, index) => (
            <div
              key={cuenta.id}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl group"
            >
              <div className="absolute top-6 right-6 flex gap-2">
                {cuentas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarCuenta(cuenta.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selector de Tipo */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                    Tipo de Pago
                  </label>
                  <div className="flex gap-4">
                    {["transferencia", "deposito"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleChange(cuenta.id, "tipo", t)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${cuenta.tipo === t ? "bg-emerald-500 border-emerald-500 text-black" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                    Banco / Establecimiento
                  </label>
                  <input
                    type="text"
                    required
                    value={cuenta.banco}
                    onChange={(e) =>
                      handleChange(cuenta.id, "banco", e.target.value)
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="Ej: BBVA o OXXO"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                    {cuenta.tipo === "transferencia"
                      ? "CLABE Interbancaria"
                      : "Número de Tarjeta / Referencia"}
                  </label>
                  <input
                    type="text"
                    required
                    value={cuenta.clabe}
                    onChange={(e) =>
                      handleChange(cuenta.id, "clabe", e.target.value)
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                    Titular de la Cuenta
                  </label>
                  <input
                    type="text"
                    required
                    value={cuenta.titular}
                    onChange={(e) =>
                      handleChange(cuenta.id, "titular", e.target.value)
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="Nombre Completo"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-white hover:bg-zinc-200 text-black font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-xl"
        >
          {saving ? "Guardando..." : "Guardar Todas las Cuentas"}
        </button>
      </form>
    </div>
  );
}
