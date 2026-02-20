"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase-client";
import TicketSelector from "@/components/TicketSelector";
import ConfirmacionCompra from "@/components/ConfirmacionCompra";
import { useRouter } from "next/navigation";
import MetodoPago from "@/components/MetodoPago";

export default function ComprarRifaPage(props) {
  const params = use(props.params);
  const slug = params.slug;

  const supabase = createClient();
  const router = useRouter();

  const [rifa, setRifa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1); // 1: Datos, 2: Pago/Referencia, 3: Espera, 4: Éxito

  // Datos del Cliente
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // Datos de la Compra (post-apartado)
  const [datosCompra, setDatosCompra] = useState(null);
  const [boletoId, setBoletoId] = useState(null);
  const [referencia, setReferencia] = useState("");

  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    async function fetchRifa() {
      const { data, error } = await supabase
        .from("rifas")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) {
        setRifa(data);
      }
      setLoading(false);
    }
    if (slug) fetchRifa();
  }, [slug, supabase]);

  // Suscripción en tiempo real para el paso 3
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
            if (payload.new.estado === "pagado") {
              setPaso(4);
            }
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
          total: cantidad * rifa.precio_boleto,
        });
        setPaso(2);
      } else {
        alert(result.error || "Ocurrió un error al apartar tus boletos.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. Intenta de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  const handleEnviarComprobante = async (e) => {
    e.preventDefault();
    if (!referencia)
      return alert("Por favor ingresa tu número de referencia o comprobante.");

    setProcesando(true);
    const { error } = await supabase
      .from("boletos")
      .update({ referencia_pago: referencia })
      .eq("id", boletoId);

    if (!error) {
      // 1. Construir mensaje de WhatsApp
      const mensaje = `Hola! Acabo de registrar mi pago para la rifa *${rifa.nombre}*.
*Folio:* ${datosCompra.folio}
*Nombre:* ${datosCompra.nombre}
*Números:* ${datosCompra.numeros.join(", ")}
*Total:* $${datosCompra.total} MXN
*Clave de Rastreo:* ${referencia}

Adjunto foto de mi comprobante aca abajo:`;

      const urlWa = `https://wa.me/584124811591?text=${encodeURIComponent(mensaje)}`;

      // 2. Abrir WhatsApp en nueva pestaña
      window.open(urlWa, "_blank");

      // 3. Pasar al paso de espera
      setPaso(3);
    } else {
      alert("Error al guardar el comprobante. Intenta de nuevo.");
    }
    setProcesando(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!rifa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p>Rifa no encontrada.</p>
      </div>
    );
  }

  // PASO 4: ÉXITO TOTAL
  if (paso === 4) {
    return <ConfirmacionCompra datos={datosCompra} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Indicador de Pasos */}
        <div className="flex justify-between mb-12 max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 -z-10"></div>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                paso >= num
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna Izquierda: Info de la Rifa */}
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

          {/* Columna Derecha: Formulario Dinámico */}
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
                    className="w-full bg-zinc-900 dark:bg-emerald-500 text-white dark:text-black font-black py-5 rounded-2xl shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {procesando ? "Procesando..." : "Apartar mis Boletos"}
                  </button>
                </form>
              </>
            )}

            {/* PASO 2: COMPROBANTE */}
            {paso === 2 && (
              <>
                <h2 className="text-2xl font-black text-center mb-4 text-zinc-900 dark:text-white uppercase">
                  Paso 2: Comprobante
                </h2>
                <p className="text-center text-zinc-500 text-sm mb-8">
                  Boletos apartados con éxito. Por favor realiza tu pago y
                  coloca la referencia aquí.
                </p>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mb-8">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                    Total a Pagar
                  </p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white">
                    ${datosCompra.total} MXN
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-2 uppercase">
                    Folio de reserva: {datosCompra.folio}
                  </p>
                </div>

                <form onSubmit={handleEnviarComprobante} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                      Referencia o Clave de Rastreo
                    </label>
                    <input
                      type="text"
                      required
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:border-emerald-500 font-mono"
                      placeholder="Ej: TRX-123456"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={procesando}
                    className="w-full bg-zinc-900 dark:bg-emerald-500 text-white dark:text-black font-black py-5 rounded-2xl shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {procesando ? "Guardando..." : "Confirmar mi Pago"}
                  </button>
                </form>
              </>
            )}

            {/* PASO 3: ESPERA */}
            {paso === 3 && (
              <div className="text-center py-10 space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-zinc-400">
                    ...
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase">
                    Validando Pago
                  </h2>
                  <p className="text-zinc-500 text-sm max-w-[250px] mx-auto leading-relaxed">
                    Un administrador está revisando tu comprobante.{" "}
                    <span className="text-emerald-500 font-bold">
                      No abandones esta página
                    </span>
                    , se actualizará sola cuando sea aprobado.
                  </p>
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Estado de tu Folio: {datosCompra.folio}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span>
                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest">
                      Pago Pendiente de Verificación
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">
                  Esto suele tardar de 5 a 15 minutos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
