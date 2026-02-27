"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase-client";
import TicketSelector from "@/components/TicketSelector";
import ConfirmacionCompra from "@/components/ConfirmacionCompra";
import { useRouter } from "next/navigation";
import MetodoPago from "@/components/MetodoPago";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function ComprarRifaPage(props) {
  const params = use(props.params);
  const slug = params.slug;

  const supabase = createClient();
  const router = useRouter();

  const [rifa, setRifa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [datosCompra, setDatosCompra] = useState(null);
  const [boletoId, setBoletoId] = useState(null);
  const [referencia, setReferencia] = useState("");

  const [procesando, setProcesando] = useState(false);

  const [metodoSeleccionado, setMetodoSeleccionado] = useState("transferencia");

  // Cálculos de validación
  const totalActual = rifa ? cantidad * rifa.precio_boleto : 0;
  const esMontoInsuficiente = totalActual < 500;

  useEffect(() => {
    async function fetchRifa() {
      const { data, error } = await supabase
        .from("rifas")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) setRifa(data);
      setLoading(false);
    }
    if (slug) fetchRifa();
  }, [slug, supabase]);

  useEffect(() => {
    if (paso === 3 && boletoId) {
      const channel = supabase
        .channel(`boleto-${boletoId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "boletos",
            filter: `id=eq.${boletoId}`,
          },
          (payload) => {
            if (payload.new.estado === "pagado") setPaso(4);
          },
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [paso, boletoId, supabase]);

  const handleApartar = async (e) => {
    e.preventDefault();

    if (esMontoInsuficiente) {
      MySwal.fire({
        title: (
          <span className="text-white uppercase font-black">
            Monto Insuficiente
          </span>
        ),
        html: (
          <p className="text-zinc-400">
            La compra mínima es de <b className="text-emerald-500">$500 MXN</b>.
            <br />
            Tu total actual es de <b>${totalActual} MXN</b>.
          </p>
        ),
        icon: "warning",
        background: "#09090b",
        color: "#ffffff",
        confirmButtonText: "Agregar más boletos",
        confirmButtonColor: "#10b981",
        customClass: {
          popup: "border border-zinc-800 rounded-3xl",
          confirmButton:
            "rounded-xl font-bold uppercase tracking-widest px-8 py-3",
        },
      });
      return;
    }

    setProcesando(true);
    try {
      const response = await fetch("/api/comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rifaId: rifa.id,
          nombre,
          telefono,
          totalBoletos: cantidad,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setBoletoId(result.id);
        setDatosCompra({
          folio: result.folio,
          nombre: nombre,
          numeros: result.numeros,
          total: totalActual,
        });
        setPaso(2);
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "No se pudo procesar el apartado.",
          background: "#09090b",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcesando(false);
    }
  };

  const handleEnviarComprobante = async (e) => {
    e.preventDefault();
    if (!referencia)
      return alert("Por favor ingresa el folio o clave de rastreo.");

    setProcesando(true);
    const { error } = await supabase
      .from("boletos")
      .update({ referencia_pago: referencia })
      .eq("id", boletoId);

    if (!error) {
      // CAMBIO: Ahora enviamos la cantidad de tickets, no la lista de números
      const mensaje = `Acabo de registrar mi pago para la rifa *${rifa.nombre}*.
*Folio:* ${datosCompra.folio}
*Nombre:* ${datosCompra.nombre}
*Cantidad:* ${cantidad} boletos 🎟️
*Total:* $${datosCompra.total} MXN
*Referencia:* ${referencia}

Adjunto foto de mi comprobante (Ticket o Pantallazo) abajo:`;

      const urlWa = `https://wa.me/527201769502?text=${encodeURIComponent(mensaje)}`;

      // Alerta final antes de saltar a WhatsApp
      MySwal.fire({
        title: "¡Casi listo!",
        text: "Ahora se abrirá WhatsApp. NO OLVIDES adjuntar la FOTO de tu comprobante en el chat.",
        icon: "info",
        confirmButtonText: "Entendido, ir a WhatsApp",
        confirmButtonColor: "#10b981",
        background: "#09090b",
        color: "#ffffff",
      }).then(() => {
        window.open(urlWa, "_blank");
        setPaso(3);
      });
    } else {
      alert("Error al guardar. Intenta de nuevo.");
    }
    setProcesando(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );

  if (!rifa)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        Rifa no encontrada.
      </div>
    );
  if (paso === 4) return <ConfirmacionCompra datos={datosCompra} />;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Indicador de Pasos */}
        <div className="flex justify-between mb-12 max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 -z-10"></div>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${paso >= num ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800"}`}
            >
              {num}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <header>
              <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                {rifa.nombre}
              </h1>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xl mt-2">
                ${rifa.precio_boleto}{" "}
                <span className="text-sm font-normal text-zinc-500 uppercase">
                  MXN por ticket
                </span>
              </p>
            </header>

            {paso === 1 && (
              <TicketSelector
                cantidad={cantidad}
                setCantidad={setCantidad}
                precioUnitario={rifa.precio_boleto}
              />
            )}
            <MetodoPago />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl h-fit sticky top-24">
            {/* PASO 1: REGISTRO */}
            {paso === 1 && (
              <>
                <h2 className="text-2xl font-black text-center mb-8 text-zinc-900 dark:text-white uppercase">
                  Paso 1: Apartar
                </h2>
                <form onSubmit={handleApartar} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:border-emerald-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:border-emerald-500"
                      placeholder="5512345678"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={procesando}
                    className={`w-full font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 ${esMontoInsuficiente ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 dark:bg-emerald-500 text-white dark:text-black"}`}
                  >
                    {procesando
                      ? "Procesando..."
                      : esMontoInsuficiente
                        ? `Faltan $${300 - totalActual} para el mínimo`
                        : "Apartar mis Boletos"}
                  </button>
                  {esMontoInsuficiente && (
                    <p className="text-[10px] text-center text-red-500 font-bold uppercase tracking-tighter">
                      La compra mínima es de $300 MXN
                    </p>
                  )}
                </form>
              </>
            )}

            {/* PASO 2: COMPROBANTE HÍBRIDO */}
            {paso === 2 && (
              <>
                <h2 className="text-2xl font-black text-center mb-4 text-zinc-900 dark:text-white uppercase">
                  Paso 2: Registro de Pago
                </h2>

                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl">
                  <p className="text-red-500 text-xs font-bold uppercase text-center leading-tight">
                    ⚠️ Importante: No se aceptan transferencias de Mercado Pago.
                    <br />
                    Por favor utiliza BBVA u otro banco.
                  </p>
                </div>

                {/* Selector de Método de Pago */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setMetodoSeleccionado("transferencia")}
                    className={`flex-1 py-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                      metodoSeleccionado === "transferencia"
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    Transferencia
                  </button>
                  <button
                    onClick={() => setMetodoSeleccionado("deposito")}
                    className={`flex-1 py-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                      metodoSeleccionado === "deposito"
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    Depósito OXXO/Banco
                  </button>
                </div>

                <form onSubmit={handleEnviarComprobante} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                      {metodoSeleccionado === "transferencia"
                        ? "Clave de Rastreo (SPEI)"
                        : "Folio / Autorización del Ticket"}
                    </label>
                    <input
                      type="text"
                      // Si es depósito, podrías hacerlo opcional quitando el 'required'
                      // o simplemente cambiar el placeholder para guiar al usuario
                      required
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:border-emerald-500 font-mono"
                      placeholder={
                        metodoSeleccionado === "transferencia"
                          ? "Ej: 1234567890..."
                          : "Ej: Folio 0987"
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={procesando}
                    className="w-full bg-zinc-900 dark:bg-emerald-500 text-white dark:text-black font-black py-5 rounded-2xl shadow-lg active:scale-95"
                  >
                    {procesando
                      ? "Guardando..."
                      : "Confirmar y Enviar a WhatsApp"}
                  </button>
                </form>
              </>
            )}

            {/* PASO 3: ESPERA */}
            {paso === 3 && (
              <div className="text-center py-10 space-y-8">
                <div className="w-24 h-24 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase">
                  Validando Pago
                </h2>
                <p className="text-zinc-500 text-sm">
                  Un administrador está revisando tu ticket.{" "}
                  <b>No cierres esta pestaña.</b>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
