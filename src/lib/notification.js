export const generarLinkWhatsapp = (datos) => {
  const { telefonoVendedor, nombreRifa, nombreComprador, numero, folio } =
    datos;

  // Aplicamos el formato de 4 dígitos (Ej: 5 -> 0005)
  const numeroFormateado = String(numero).padStart(4, "0");

  // Construimos el mensaje siguiendo el esquema de la propuesta
  const mensaje =
    `¡Hola! Nuevo boleto registrado 🎟️%0A%0A` +
    `Rifa: ${nombreRifa}%0A` +
    `Comprador: ${nombreComprador}%0A` +
    `Número asignado: #${numeroFormateado}%0A` +
    `Folio: ${folio}%0A%0A` +
    `Por favor verificar el pago.`;

  // Retornamos el link wa.me
  return `https://wa.me/${telefonoVendedor}?text=${mensaje}`;
};
