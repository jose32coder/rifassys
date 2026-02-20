import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";

export default async function RifasAdminPage() {
  const supabase = await createClient();

  const { data: rifas, error } = await supabase
    .from("rifas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-1">Rifas</h1>
          <p className="text-zinc-500">
            Administra tus sorteos activos e históricos.
          </p>
        </div>
        <Link
          href="/admin/rifas/nueva"
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
        >
          + Nueva Rifa
        </Link>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Mobile View: Cards */}
        <div className="lg:hidden divide-y divide-zinc-800">
          {rifas?.map((rifa) => (
            <div key={rifa.id} className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0">
                  <Image
                    src={rifa.imagen_url || "/placeholder-rifa.jpg"}
                    alt={rifa.nombre}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg leading-tight">
                    {rifa.nombre}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    ID: {rifa.id.substring(0, 8)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                    Estado
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      rifa.estado === "activa"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {rifa.estado}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                    Precio
                  </p>
                  <span className="font-black text-white text-sm">
                    ${rifa.precio_boleto.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div className="flex justify-between text-[10px] font-black text-zinc-500 mb-2 uppercase tracking-widest">
                  <span>
                    Vendidos: {rifa.boletos_vendidos}/{rifa.total_boletos}
                  </span>
                  <span>
                    {Math.round(
                      (rifa.boletos_vendidos / rifa.total_boletos) * 100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
                    style={{
                      width: `${(rifa.boletos_vendidos / rifa.total_boletos) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/rifas/${rifa.id}/editar`}
                  className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Editar
                </Link>
                <button className="px-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-all border border-red-500/20">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50">
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Rifa
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Estado
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Progreso
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Precio
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rifas?.map((rifa) => (
                <tr
                  key={rifa.id}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Image
                          src={rifa.imagen_url || "/placeholder-rifa.jpg"}
                          alt={rifa.nombre}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-black text-white text-base leading-tight uppercase">
                          {rifa.nombre}
                        </p>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                          ID: {rifa.id.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        rifa.estado === "activa"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {rifa.estado}
                    </span>
                  </td>
                  <td className="px-6 py-6 min-w-[150px]">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>
                          {rifa.boletos_vendidos}/{rifa.total_boletos}
                        </span>
                        <span>
                          {Math.round(
                            (rifa.boletos_vendidos / rifa.total_boletos) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
                          style={{
                            width: `${(rifa.boletos_vendidos / rifa.total_boletos) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-black text-white text-base">
                    ${rifa.precio_boleto.toLocaleString()}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/rifas/${rifa.id}/editar`}
                        className="p-3 bg-zinc-800 hover:bg-emerald-500 hover:text-black rounded-xl text-zinc-400 transition-all active:scale-90"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                      <button
                        className="p-3 bg-zinc-800 hover:bg-red-500 text-white rounded-xl text-zinc-400 transition-all hover:text-white active:scale-90 border border-transparent hover:border-red-500/20"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rifas?.length === 0 && (
          <div className="px-6 py-20 text-center space-y-4">
            <span className="text-4xl">🎫</span>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm">
              No hay rifas registradas aún.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
