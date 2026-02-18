export default function MetodoPago() {
  return (
    <section className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-300">
        <span className="text-emerald-500">💳</span> Datos de Transferencia
      </h2>
      <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
            Banco
          </p>
          <p className="text-lg font-semibold">BBVA México</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
            CLABE Interbancaria
          </p>
          <p className="text-xl font-mono text-emerald-400 font-bold select-all cursor-copy">
            0123 4567 8901 2345 67
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
            Titular
          </p>
          <p className="text-lg">Persona R</p>
        </div>
      </div>
    </section>
  );
}
