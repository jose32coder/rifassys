"use client";

export default function TicketSelector({
  cantidad,
  setCantidad,
  precioUnitario,
}) {
  const opciones = [5, 10, 25, 50, 100, 200];
  const total = cantidad * precioUnitario;

  return (
    <section className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-yellow-500">🎫</span> Cantidad de Tickets
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {opciones.map((num) => (
          <button
            key={num}
            onClick={() => setCantidad(num)}
            className={`py-3 rounded-xl font-bold transition-all ${
              cantidad === num
                ? "bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                : "bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-8 mb-8">
        <button
          onClick={() => setCantidad(Math.max(1, cantidad - 1))}
          className="w-12 h-12 rounded-full border-2 border-red-500/50 text-red-500 text-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
        >
          {" "}
          −{" "}
        </button>
        <span className="text-6xl font-black tabular-nums">{cantidad}</span>
        <button
          onClick={() => setCantidad(cantidad + 1)}
          className="w-12 h-12 rounded-full border-2 border-emerald-500/50 text-emerald-500 text-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
        >
          {" "}
          +{" "}
        </button>
      </div>

      <div className="border-t border-zinc-800 pt-6 flex justify-between items-end">
        <p className="text-zinc-500 font-medium">Inversión Total</p>
        <p className="text-4xl font-black text-yellow-500">
          ${total.toLocaleString()}.00{" "}
          <span className="text-sm text-zinc-400">MXN</span>
        </p>
      </div>
    </section>
  );
}
