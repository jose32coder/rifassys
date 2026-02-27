"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { Plus, Trash2, Landmark, Ticket, Settings2, Save } from "lucide-react";

export default function AjustesAdminPage() {
  const supabase = createClient();
  const [tab, setTab] = useState("pagos"); // 'pagos' o 'tickets'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // Estados de Datos
  const [cuentas, setCuentas] = useState([]);
  const [opcionesTickets, setOpcionesTickets] = useState([1, 10, 20]);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from("configuracion").select("*");

      const configPagos = data?.find((i) => i.clave === "datos_pago");
      const configTickets = data?.find((i) => i.clave === "opciones_tickets");

      if (configPagos) setCuentas(configPagos.valor);
      if (configTickets) setOpcionesTickets(configTickets.valor);

      setLoading(false);
    }
    fetchConfig();
  }, [supabase]);

  // --- Lógica de Pagos ---
  const agregarCuenta = () =>
    setCuentas([
      ...cuentas,
      {
        id: Date.now(),
        tipo: "transferencia",
        banco: "",
        clabe: "",
        titular: "",
      },
    ]);
  const eliminarCuenta = (id) => setCuentas(cuentas.filter((c) => c.id !== id));
  const handleCuentaChange = (id, field, value) =>
    setCuentas(
      cuentas.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );

  // --- Lógica de Tickets ---
  const actualizarOpcionTicket = (index, valor) => {
    const nuevas = [...opcionesTickets];
    nuevas[index] = Number(valor);
    setOpcionesTickets(nuevas);
  };
  const agregarOpcionTicket = () => setOpcionesTickets([...opcionesTickets, 0]);
  const eliminarOpcionTicket = (index) =>
    setOpcionesTickets(opcionesTickets.filter((_, i) => i !== index));

  // --- Guardar Todo ---
  const saveConfig = async () => {
    setSaving(true);
    const updates = [
      { clave: "datos_pago", valor: cuentas },
      { clave: "opciones_tickets", valor: opcionesTickets },
    ];

    const { error } = await supabase
      .from("configuracion")
      .upsert(updates, { onConflict: "clave" });

    if (!error) {
      setStatus({
        type: "success",
        message: "Configuración actualizada en la nube.",
      });
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus({ type: "error", message: error.message });
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="py-20 text-center text-emerald-500">Cargando...</div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* MENÚ DE SELECCIÓN (TABS) */}
      <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 gap-2">
        <button
          onClick={() => setTab("pagos")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${tab === "pagos" ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-white"}`}
        >
          <Landmark size={18} /> Configuración de Pago
        </button>
        <button
          onClick={() => setTab("tickets")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${tab === "tickets" ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-white"}`}
        >
          <Ticket size={18} /> Selección de Tickets
        </button>
      </div>

      {status && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold border ${status.type === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
        >
          {status.message}
        </div>
      )}

      {/* VISTA: CONFIGURACIÓN DE PAGOS */}
      {tab === "pagos" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <header className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white">
              Cuentas Bancarias
            </h2>
            <button
              onClick={agregarCuenta}
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-white"
            >
              <Plus />
            </button>
          </header>
          {cuentas.map((cuenta) => (
            <div
              key={cuenta.id}
              className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4"
            >
              {/* NUEVO: Selector de Tipo de Movimiento */}
              <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                {["transferencia", "deposito", "ambos"].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => handleCuentaChange(cuenta.id, "tipo", tipo)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${
                      cuenta.tipo === tipo
                        ? "bg-emerald-500 text-black"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>

              <input
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                placeholder="Banco (Ej: BBVA, OXXO/Santander)"
                value={cuenta.banco}
                onChange={(e) =>
                  handleCuentaChange(cuenta.id, "banco", e.target.value)
                }
              />

              <input
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono"
                placeholder="CLABE / Tarjeta / Convenio"
                value={cuenta.clabe}
                onChange={(e) =>
                  handleCuentaChange(cuenta.id, "clabe", e.target.value)
                }
              />

              {/* Campo adicional opcional para Titular o instrucciones */}
              <input
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm"
                placeholder="Titular / Instrucciones (Opcional)"
                value={cuenta.titular || ""}
                onChange={(e) =>
                  handleCuentaChange(cuenta.id, "titular", e.target.value)
                }
              />

              <button
                onClick={() => eliminarCuenta(cuenta.id)}
                className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 hover:underline"
              >
                <Trash2 size={12} /> Eliminar cuenta
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VISTA: CONFIGURACIÓN DE TICKETS */}
      {tab === "tickets" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <header className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white">
              Botones de Selección
            </h2>
            <button
              onClick={agregarOpcionTicket}
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-white"
            >
              <Plus />
            </button>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {opcionesTickets.map((num, index) => (
              <div key={index} className="relative group">
                <input
                  type="number"
                  value={num}
                  onChange={(e) =>
                    actualizarOpcionTicket(index, e.target.value)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-xl font-bold text-emerald-500 focus:border-emerald-500 outline-none"
                />
                <button
                  onClick={() => eliminarOpcionTicket(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-sm italic">
            Estos números aparecerán como botones rápidos en el selector de
            boletos del cliente.
          </p>
        </div>
      )}

      {/* BOTÓN FLOTANTE O FIJO PARA GUARDAR */}
      <button
        onClick={saveConfig}
        disabled={saving}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {saving ? (
          "Procesando..."
        ) : (
          <>
            <Save size={20} /> Guardar Cambios en la Nube
          </>
        )}
      </button>
    </div>
  );
}
