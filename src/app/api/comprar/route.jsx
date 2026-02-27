import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { rifaId, nombre, telefono, totalBoletos } = body;

    // 0. Consultar datos de la rifa (para el precio)
    const { data: rifa, error: errorRifa } = await supabase
      .from("rifas")
      .select("*")
      .eq("id", rifaId)
      .single();

    if (errorRifa || !rifa) throw new Error("Rifa no encontrada");

    // 1. Consultar números ya usados con validación de nulidad
    const { data: usados, error: errorFetch } = await supabase
      .from("boletos")
      .select("numero_boleto")
      .eq("rifa_id", rifaId)
      .in("estado", ["pendiente", "pagado"]); // Solo los que están apartados o pagados

    if (errorFetch) {
      console.error("Error al consultar boletos usados:", errorFetch);
      throw new Error(
        `Error al consultar disponibilidad: ${errorFetch.message}`,
      );
    }

    // Aplanamos todos los números usados de todas las filas (manejando comas)
    const numerosUsados = usados
      ? usados.flatMap((b) =>
          b.numero_boleto.split(",").map((n) => parseInt(n.trim())),
        )
      : [];

    // 2. Lógica de disponibilidad OPTIMIZADA
    const limiteRifa = rifa.total_boletos || 1000;
    const usadosSet = new Set(numerosUsados); // Un Set es 1000x más rápido para buscar
    const seleccionados = [];

    // Intentamos buscar números al azar de forma eficiente
    while (seleccionados.length < totalBoletos) {
      const numAleatorio = Math.floor(Math.random() * limiteRifa) + 1;

      // Si el número no está en usados y no ha sido seleccionado en este ciclo
      if (
        !usadosSet.has(numAleatorio) &&
        !seleccionados.includes(numAleatorio)
      ) {
        seleccionados.push(numAleatorio);
      }

      // Salvaguarda: si por alguna razón no hay suficientes (muy raro por el check anterior)
      if (usadosSet.size + seleccionados.length >= limiteRifa) break;
    }

    if (seleccionados.length < totalBoletos) {
      return NextResponse.json(
        { error: "No hay suficientes boletos disponibles" },
        { status: 400 },
      );
    }

    const folio = `RIFA-2026-${Math.random().toString(36).toUpperCase().substring(2, 6)}`;

    // 3. Insertar con los nombres de columna exactos de tu DB
    const { data: insertedData, error: errorInsert } = await supabase
      .from("boletos")
      .insert([
        {
          rifa_id: rifaId,
          numero_boleto: seleccionados.join(", "),
          folio: folio,
          comprador_nombre: nombre,
          comprador_telefono: telefono,
          estado: "pendiente", // Inicia como pendiente
          monto_pagado: totalBoletos * rifa.precio_boleto,
          referencia_pago: "PENDIENTE",
        },
      ])
      .select()
      .single();

    if (errorInsert) {
      console.error("Error Supabase Insert:", errorInsert);
      return NextResponse.json({ error: errorInsert.message }, { status: 500 });
    }

    // 4. Actualizar el contador de vendidos en la rifa (incluyendo apartados)
    const nuevosVendidos = (rifa.boletos_vendidos || 0) + totalBoletos;
    const { error: errorRifaUpdate } = await supabase
      .from("rifas")
      .update({ boletos_vendidos: nuevosVendidos })
      .eq("id", rifaId);

    if (errorRifaUpdate) {
      console.error("Error updating rifa sales:", errorRifaUpdate);
      // Opcional: podrías decidir si fallar aquí o continuar
    }

    // 5. Registrar actividad
    await supabase.from("actividades").insert([
      {
        tipo: "reserva",
        descripcion: `Nueva reserva: ${nombre} (${totalBoletos} boletos)`,
        monto: 0, // Las reservas no cuentan como ingreso hasta que se pagan
        metadata: {
          folio: folio,
          comprador: nombre,
          rifa_nombre: rifa.nombre,
          cantidad: totalBoletos,
          boleto_id: insertedData.id,
        },
      },
    ]);

    // 6. Revalidar rutas para limpiar caché de Next.js
    revalidatePath(`/rifa/${rifa.slug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/finanzas");

    return NextResponse.json(
      {
        id: insertedData.id,
        numeros: seleccionados,
        folio: folio,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Critical API Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
