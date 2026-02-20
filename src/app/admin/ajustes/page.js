"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";

export default function AjustesPagoPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const [formData, setFormData] = useState({
    banco: "",
    clabe: "",
    titular: "",
  });

  useEffect(() => {
    async function fetchAjustes() {
      // Intentamos obtener la configuración dinámica
      const { data, error } = await supabase
        .from("configuracion")
        .select("*")
        .eq("clave", "datos_pago")
        .single();

      if (data) {
        setFormData(data.valor);
      }
      setLoading(false);
    }
    fetchAjustes();
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const { error } = await supabase.from("configuracion").upsert(
      {
        clave: "datos_pago",
        valor: formData,
      },
      { onConflict: "clave" },
    );

    if (!error) {
      // Registrar actividad
      await supabase.from("actividades").insert([
        {
          tipo: "ajuste",
          descripcion: "Configuración de pagos actualizada",
          monto: 0,
          metadata: { banco: formData.banco },
        },
      ]);

      setStatus({
        type: "success",
        message: "Ajustes guardados correctamente.",
      });
    } else {
      console.error("Error al guardar ajustes:", error);
      setStatus({
        type: "error",
        message: "Error al guardar: " + error.message,
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white mb-1">Ajustes</h1>
        <p className="text-zinc-500">
          Configura los datos de transferencia que verán tus clientes.
        </p>
      </header>

      <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {status && (
            <div
              className={`p-4 rounded-xl text-sm font-bold ${
                status.type === "success"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              Nombre del Banco
            </label>
            <input
              type="text"
              required
              value={formData.banco}
              onChange={(e) =>
                setFormData({ ...formData, banco: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="Ej: BBVA México"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              CLABE Interbancaria
            </label>
            <input
              type="text"
              required
              value={formData.clabe}
              onChange={(e) =>
                setFormData({ ...formData, clabe: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
              placeholder="0123 4567 8901 2345 67"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              Titular de la Cuenta
            </label>
            <input
              type="text"
              required
              value={formData.titular}
              onChange={(e) =>
                setFormData({ ...formData, titular: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="Nombre del Titular"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-zinc-900/50 border border-dashed border-zinc-800 p-6 rounded-3xl">
        <p className="text-xs text-zinc-500 leading-relaxed italic">
          Nota: Los cambios realizados aquí se reflejarán inmediatamente en la
          página de pago de todas tus rifas activas. Asegúrate de que los datos
          sean correctos antes de guardar.
        </p>
      </div>
    </div>
  );
}
