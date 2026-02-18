const numeroFormateado = String(numeroAsignado).padStart(4, "0");

return (
  <div className="text-center p-6">
    <h2 className="text-2xl font-bold">¡Boleto Registrado!</h2>
    <p className="text-4xl my-4 font-mono bg-gray-100 p-4 rounded">
      #{numeroFormateado}
    </p>
    <p className="text-sm text-gray-500">Folio: {folio}</p>
  </div>
);
