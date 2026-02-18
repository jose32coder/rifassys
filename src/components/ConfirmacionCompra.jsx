export default function ConfirmacionCompra({ datos }) {
  const mensajeWhatsApp = `Hola Osmel! Acabo de registrar mi pago.
*Folio:* ${datos.folio}
*Nombre:* ${datos.nombre}
*Boletos:* ${datos.numeros.join(", ")}
*Total:* $${datos.total} MXN
Adjunto mi comprobante:`;

  const urlWhatsApp = `https://wa.me/521234567890?text=${encodeURIComponent(mensajeWhatsApp)}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
          ✓
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">¡Registro Exitoso!</h2>
          <p className="text-zinc-400">Tus números han sido reservados.</p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-left ml-1">
            Tus Números (#${datos.folio})
          </p>
          <div className="flex flex-wrap gap-2 justify-start">
            {datos.numeros.map((num) => (
              <span
                key={num}
                className="bg-emerald-500/10 text-emerald-500 font-mono font-bold px-3 py-1 rounded-lg border border-emerald-500/20 text-sm"
              >
                #{num.toString().padStart(4, "0")}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-sm text-zinc-400">
            Para finalizar, envía tu comprobante por WhatsApp. Tu lugar no está
            asegurado hasta que se valide el pago.
          </p>
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#1fb355] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-900/20"
          >
            <span className="text-xl">💬</span>
            ENVIAR COMPROBANTE
          </a>
        </div>
      </div>
    </div>
  );
}
