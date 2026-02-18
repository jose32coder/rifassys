"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Para leer la URL
import { supabase } from "@/lib/supabase";

export default function VerificadorGlobal() {
  const searchParams = useSearchParams();
  const rifaIdContexto = searchParams.get("rifaId"); // Captura el ID si existe

  const [phone, setPhone] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarTickets = async () => {
    setLoading(true);

    // Iniciamos la consulta base
    let query = supabase
      .from("boletos")
      .select(
        `
        numero_boleto,
        estado,
        rifas ( nombre, id )
      `,
      )
      .eq("whatsapp_comprador", phone);

    // SI hay un rifaId en la URL, filtramos solo por esa rifa (Verificación Específica)
    if (rifaIdContexto) {
      query = query.eq("rifa_id", rifaIdContexto);
    }

    const { data, error } = await query;

    if (!error) setResultados(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Título Dinámico */}
        <section className="text-center">
          <h1 className="text-3xl font-black mb-2">
            {rifaIdContexto ? "Verificar mi Boleto" : "Verificador Global"}
          </h1>
          <p className="text-zinc-400">
            {rifaIdContexto
              ? "Consulta tu participación en esta rifa"
              : "Consulta todos tus números comprados en la plataforma"}
          </p>
        </section>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-4">
          <input
            type="tel"
            placeholder="Ingresa tu WhatsApp (10 dígitos)"
            className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={buscarTickets}
            className="w-full bg-emerald-600 font-bold py-4 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
          >
            {loading ? "Buscando..." : "Verificar Números"}
          </button>
        </div>

        {/* Lista de Resultados con indicador de contexto */}
        <div className="grid gap-4">
          {resultados.length > 0
            ? resultados.map((item, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-bottom-2"
                >
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                      {item.rifas.nombre}
                    </p>
                    <p className="text-xl font-mono font-bold text-emerald-400">
                      #{item.numero_boleto.toString().padStart(4, "0")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${
                        item.estado === "confirmado"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {item.estado.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            : !loading &&
              phone && (
                <p className="text-center text-zinc-500 text-sm">
                  No se encontraron boletos asociados a este número.
                </p>
              )}
        </div>
      </div>
    </div>
  );
}
