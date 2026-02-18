export default function VerificadorRifa({ rifaId }) {
  // Lógica similar a la anterior pero añadiendo el filtro:
  // .eq('rifa_id', rifaId)
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl mt-8">
      <h3 className="font-bold mb-4">¿Ya compraste? Verifica tu número aquí</h3>
      <div className="flex gap-2">
        <input
          type="tel"
          placeholder="Ingresa tu DNI o WhatsApp"
          className="flex-1 bg-zinc-800/50 border-zinc-700 rounded-lg p-2 text-sm outline-none"
        />
        <button className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg text-sm font-bold">
          Verificar
        </button>
      </div>
    </div>
  );
}
