"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function RifaForm({ initialData = null }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    slug: initialData?.slug || "", // Agregamos el campo slug
    descripcion: initialData?.descripcion || "",
    precio_boleto: initialData?.precio_boleto || "",
    total_boletos: initialData?.total_boletos || 1000,
    imagen_url: initialData?.imagen_url || "",
    estado: initialData?.estado || "activa",
  });

  // Función para convertir texto en URL amigable
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize("NFD") // Quita acentos
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-") // Reemplaza espacios por guiones
      .replace(/[^\w-]+/g, "") // Quita caracteres especiales
      .replace(/--+/g, "-"); // Evita guiones dobles
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Si el usuario cambia el nombre, actualizamos el slug automáticamente
      if (name === "nombre") {
        newData.slug = generateSlug(value);
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      precio_boleto: parseFloat(formData.precio_boleto),
      total_boletos: parseInt(formData.total_boletos),
    };

    let result;
    if (initialData?.id) {
      result = await supabase
        .from("rifas")
        .update(payload)
        .eq("id", initialData.id);
    } else {
      result = await supabase.from("rifas").insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      router.push("/admin/rifas");
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl overflow-hidden relative"
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full"></div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Nombre del Sorteo
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
            placeholder="Ej: Rifa Navideña iPhone 15"
          />
        </div>

        {/* Nuevo campo: Slug (Solo lectura o visible para confirmar) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
            URL Amigable (Slug)
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            readOnly // Lo dejamos solo lectura para evitar errores del usuario
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-500 cursor-not-allowed italic"
            placeholder="se-genera-solo"
          />
        </div>
      </div>

      {/* ... Resto de tus campos (Descripción, Precio, etc) igual que antes ... */}

      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows="3"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
          placeholder="Escribe los detalles del premio y condiciones..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Precio por Boleto (MXN)
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
              $
            </span>
            <input
              type="number"
              name="precio_boleto"
              value={formData.precio_boleto}
              onChange={handleChange}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Total de Boletos
          </label>
          <input
            type="number"
            name="total_boletos"
            value={formData.total_boletos}
            onChange={handleChange}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
            placeholder="1000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="activa">Activa</option>
            <option value="pausada">Pausada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
      </div>

      {/* URL de Imagen */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
          URL de Imagen
        </label>
        <input
          type="text"
          name="imagen_url"
          value={formData.imagen_url}
          onChange={handleChange}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
          placeholder="https://..."
        />
      </div>

      <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-4 rounded-2xl font-bold text-zinc-500 hover:text-white transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-zinc-950 font-black px-10 py-4 rounded-2xl hover:bg-zinc-200 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {loading
            ? "Guardando..."
            : initialData?.id
              ? "Actualizar Rifa"
              : "Crear Rifa"}
        </button>
      </div>
    </form>
  );
}
