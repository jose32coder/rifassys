// app/page.js
import { supabase } from "@/lib/supabase";
import RifaCard from "@/components/RifaCard";
import Link from "next/link";

export default async function HomePage() {
  const { data: rifas, error } = await supabase
    .from("rifas")
    .select("*")
    .eq("estado", "activa")
    .order("created_at", { ascending: false });

  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-medium">
        Error al cargar las rifas. Por favor, intenta de nuevo.
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 relative">
      {/* Botón de Verificación Global Flotante */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          href="/verificar"
          className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 px-5 py-2.5 rounded-full shadow-xl hover:scale-105 transition-all group"
        >
          <span className="text-emerald-500 group-hover:animate-pulse">🎫</span>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Verificar boletos
          </span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-12 text-center pt-16">
          {" "}
          {/* Aumenté el padding top para no chocar con el botón */}
          <h1 className="text-3xl sm:text-5xl font-black mb-3 text-zinc-900 dark:text-white tracking-tight">
            🎟️ Gana con Osmel 🎟️
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-lg">
            Participa y gana increíbles premios con nosotros
          </p>
        </header>

        {rifas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-xl text-zinc-400 dark:text-zinc-600 font-medium">
              No hay rifas activas en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rifas.map((rifa) => (
              <RifaCard key={rifa.id} rifa={rifa} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
