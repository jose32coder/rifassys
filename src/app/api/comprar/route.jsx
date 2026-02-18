import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { rifaId, nombre, telefono, totalBoletos } = await request.json();

  // 1. Consultar números ya usados [cite: 83, 90]
  const { data: usados } = await supabase
    .from("boletos")
    .select("numero_ticket")
    .eq("rifa_id", rifaId);

  const numerosUsados = usados.map((b) => b.numero_ticket);

  // 2. Filtrar disponibles y elegir uno al azar [cite: 84, 85, 96]
  const disponibles = Array.from(
    { length: totalBoletos },
    (_, i) => i + 1,
  ).filter((n) => !numerosUsados.includes(n));

  if (disponibles.length === 0) {
    return NextResponse.json(
      { error: "No hay boletos disponibles" },
      { status: 400 },
    );
  }

  const numeroAsignado =
    disponibles[Math.floor(Math.random() * disponibles.length)];

  // 3. Generar Folio Único (Ej: RIFA-2025-K8PZ) [cite: 97, 98]
  const folio = `RIFA-2025-${Math.random().toString(36).toUpperCase().substring(2, 6)}`;

  // 4. Guardar en la base de datos [cite: 63]
  const { data, error } = await supabase.from("boletos").insert([
    {
      rifa_id: rifaId,
      numero_ticket: numeroAsignado,
      folio: folio,
      comprador_nombre: nombre,
      comprador_telefono: telefono,
      estado: "pendiente",
    },
  ]);

  return NextResponse.json({ numero: numeroAsignado, folio: folio });
}
