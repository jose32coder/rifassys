import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function FinanzasPage({ searchParams }) {
  const supabase = await createClient();
  const range = (await searchParams).range || "mes"; // hoy, semana, mes

  // Calcular fechas de filtrado
  const now = new Date();
  let startDate = new Date();

  if (range === "hoy") {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "semana") {
    // 7 días atrás
    startDate.setDate(now.getDate() - 7);
  } else {
    // 30 días atrás (mes por defecto)
    startDate.setDate(now.getDate() - 30);
  }

  // 1. Obtener ingresos del periodo (solo 'pago')
  const { data: pagosPeriodo } = await supabase
    .from("actividades")
    .select("*")
    .eq("tipo", "pago")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });

  // 2. Obtener estadísticas de todas las rifas para ver avance
  const { data: rifas } = await supabase
    .from("rifas")
    .select("*")
    .order("created_at", { ascending: false });

  // Cálculos de periodo
  const recaudacionPeriodo =
    pagosPeriodo?.reduce((acc, curr) => acc + (curr.monto || 0), 0) || 0;
  const boletosVendidosPeriodo = pagosPeriodo?.length || 0;

  // Cálculos totales históricos (desde boletos pagados)
  const { data: todosLosPagos } = await supabase
    .from("boletos")
    .select("monto_pagado")
    .eq("estado", "pagado");

  const ingresosHistoricos =
    todosLosPagos?.reduce((acc, curr) => acc + (curr.monto_pagado || 0), 0) ||
    0;

  const stats = [
    {
      name: `Ingresos (${range})`,
      value: `$${recaudacionPeriodo.toLocaleString()} MXN`,
      color: "text-emerald-500",
      icon: "💰",
    },
    {
      name: `Ventas (${range})`,
      value: boletosVendidosPeriodo,
      color: "text-blue-500",
      icon: "🎟️",
    },
    {
      name: "Ingresos Totales",
      value: `$${ingresosHistoricos.toLocaleString()} MXN`,
      color: "text-purple-500",
      icon: "📈",
    },
  ];

  const rangeButtons = [
    { label: "Hoy", value: "hoy" },
    { label: "Últimos 7 días", value: "semana" },
    { label: "Últimos 30 días", value: "mes" },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
            Finanzas
          </h1>
          <p className="text-zinc-500 font-medium">
            Análisis de ventas y rendimiento de tus rifas.
          </p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 self-start">
          {rangeButtons.map((btn) => (
            <Link
              key={btn.value}
              href={`/admin/finanzas?range=${btn.value}`}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                range === btn.value
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {btn.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                Cifras reales
              </span>
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
              {stat.name}
            </p>
            <p className={`text-3xl font-black text-white`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rendimiento por Rifa */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <span className="text-emerald-500">🏆</span> Rendimiento por Rifa
          </h3>

          <div className="space-y-6">
            {rifas?.map((rifa) => {
              const progreso =
                (rifa.boletos_vendidos / rifa.total_boletos) * 100;
              const recaudado =
                (rifa.boletos_vendidos || 0) * (rifa.precio_boleto || 0);

              return (
                <div key={rifa.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white font-black text-sm uppercase">
                        {rifa.nombre}
                      </p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        {rifa.boletos_vendidos} / {rifa.total_boletos} VENDIDOS
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-500 font-black text-sm">
                        ${recaudado.toLocaleString()}
                      </p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        {progreso.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                    <div
                      className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                      style={{ width: `${Math.min(progreso, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalle de Ingresos Recientes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <span className="text-emerald-500">📥</span> Detalle de Ingresos (
            {range})
          </h3>

          <div className="flex-1 space-y-4">
            {pagosPeriodo && pagosPeriodo.length > 0 ? (
              pagosPeriodo.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {pago.metadata?.comprador}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">
                      Folio: {pago.metadata?.folio || "---"} •{" "}
                      {new Date(pago.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-emerald-500 font-black text-base">
                      +${(pago.monto || 0).toLocaleString()}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Confirmado
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                <span className="text-4xl mb-4 grayscale opacity-20">📊</span>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  No hay ingresos registrados en este periodo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
