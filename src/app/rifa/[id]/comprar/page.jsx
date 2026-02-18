"use client";
import React, { useState, use } from "react"; // 1. Importamos 'use'
import { supabase } from "@/lib/supabase";
import TicketSelector from "@/components/TicketSelector";
import MetodoPago from "@/components/MetodoPago";
import ConfirmacionCompra from "@/components/ConfirmacionCompra";

export default function ComprarBoleto({ params }) {
  // 2. Desempaquetamos los params correctamente
  const unwrappedParams = use(params);
  const rifaId = unwrappedParams.id;

  const [loading, setLoading] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [datosCompra, setDatosCompra] = useState(null);

  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [referencia, setReferencia] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const precioUnitario = 250;

  const handleSubmit = async () => {
    if (!nombre || !whatsapp || !referencia) {
      alert("Por favor rellena todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const nuevosNumeros = Array.from({ length: cantidad }, () =>
        Math.floor(Math.random() * 9000 + 1000),
      );

      // 3. Verificación de columnas: Asegúrate que en Supabase se llamen así.
      // Si te sigue dando error, verifica que no sea 'comprador_nombre' o algo similar.
      const { data, error } = await supabase
        .from("boletos")
        .insert([
          {
            rifa_id: rifaId, // Usamos la variable desempaquetada
            whatsapp_comprador: whatsapp,
            nombre_comprador: nombre,
            referencia_pago: referencia,
            numero_boleto: nuevosNumeros,
            estado: "pendiente",
          },
        ])
        .select();

      if (error) throw error;

      setDatosCompra({
        folio: data[0].id.split("-")[0].toUpperCase(),
        numeros: nuevosNumeros,
        nombre: nombre,
        total: cantidad * precioUnitario,
      });

      setCompletado(true);
    } catch (error) {
      console.error("Error detallado:", error);
      alert("Error de base de datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (completado) return <ConfirmacionCompra datos={datosCompra} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      {/* ... Resto de tu JSX igual que antes ... */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <TicketSelector
            cantidad={cantidad}
            setCantidad={setCantidad}
            precioUnitario={precioUnitario}
          />
          <MetodoPago />
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-6 h-fit lg:sticky lg:top-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-emerald-500">👤</span> Información
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nombre Completo"
            />
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="WhatsApp"
            />
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Referencia"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 py-4 rounded-2xl font-black"
          >
            {loading ? "PROCESANDO..." : "CONFIRMAR Y PARTICIPAR"}
          </button>
        </div>
      </div>
    </div>
  );
}
