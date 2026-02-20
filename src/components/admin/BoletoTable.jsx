"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function BoletoTable({ initialData, rifasList = [] }) {
  const supabase = createClient();
  const router = useRouter();

  // State for data and loading
  const [data, setData] = useState(initialData);
  const [loadingId, setLoadingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalBoleto, setModalBoleto] = useState(null);

  // State for Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [rifaFilter, setRifaFilter] = useState("todas");

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Update local data when initialData changes (e.g. after a refresh)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const updateEstado = async (id, nuevoEstado, rifaId, cantidadBoletos) => {
    if (nuevoEstado === "vencido") {
      const result = await MySwal.fire({
        title: "¿Estás seguro?",
        text: "La reserva se marcará como vencida y los números volverán a estar disponibles.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#3f3f46",
        confirmButtonText: "Sí, vencer reserva",
        cancelButtonText: "Cancelar",
        background: "#18181b",
        color: "#fff",
        customClass: {
          popup: "rounded-3xl border border-zinc-800 shadow-2xl",
          confirmButton:
            "rounded-xl font-black uppercase tracking-widest text-xs py-3 px-6",
          cancelButton:
            "rounded-xl font-black uppercase tracking-widest text-xs py-3 px-6",
        },
      });

      if (!result.isConfirmed) return;
    }

    setLoadingId(id);

    const { error: errorBoleto } = await supabase
      .from("boletos")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (!errorBoleto) {
      const boletoActual = data.find((b) => b.id === id);

      if (nuevoEstado === "pagado" && boletoActual) {
        await supabase.from("actividades").insert([
          {
            tipo: "pago",
            descripcion: `Pago confirmado: ${boletoActual.comprador_nombre} (Folio ${boletoActual.folio})`,
            monto: boletoActual.monto_pagado || 0,
            metadata: {
              folio: boletoActual.folio,
              comprador: boletoActual.comprador_nombre,
              rifa_nombre: boletoActual.rifas?.nombre,
              boleto_id: id,
            },
          },
        ]);
      }

      if (nuevoEstado === "vencido") {
        const { data: rifaData } = await supabase
          .from("rifas")
          .select("boletos_vendidos")
          .eq("id", rifaId)
          .single();

        if (rifaData) {
          const nuevosVendidos = Math.max(
            0,
            (rifaData.boletos_vendidos || 0) - cantidadBoletos,
          );
          await supabase
            .from("rifas")
            .update({ boletos_vendidos: nuevosVendidos })
            .eq("id", rifaId);
        }
        if (boletoActual) {
          await supabase.from("actividades").insert([
            {
              tipo: "vencimiento",
              descripcion: `Reserva vencida: ${boletoActual.comprador_nombre} (Folio ${boletoActual.folio})`,
              monto: 0,
              metadata: {
                folio: boletoActual.folio,
                comprador: boletoActual.comprador_nombre,
                boleto_id: id,
              },
            },
          ]);
        }
      }

      setData((prev) =>
        prev.map((b) => (b.id === id ? { ...b, estado: nuevoEstado } : b)),
      );
    }
    setLoadingId(null);
  };

  // Logic: Filter Data
  const filteredData = useMemo(() => {
    return data.filter((b) => {
      const matchesSearch =
        b.comprador_nombre.toLowerCase().includes(search.toLowerCase()) ||
        b.folio.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" || b.estado === statusFilter;
      const matchesRifa = rifaFilter === "todas" || b.rifa_id === rifaFilter;

      return matchesSearch && matchesStatus && matchesRifa;
    });
  }, [data, search, statusFilter, rifaFilter]);

  // Logic: Paginate Data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, rifaFilter, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Search & Filters Panel */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-3xl shadow-xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por comprador o folio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Rifa Filter */}
            <select
              value={rifaFilter}
              onChange={(e) => setRifaFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer min-w-[140px]"
            >
              <option value="todas">Todas las Rifas</option>
              {rifasList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="todos">Estados: Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="pagado">Pagados</option>
              <option value="vencido">Vencidos</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className={`p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-all active:scale-90 ${isRefreshing ? "animate-spin" : ""}`}
              title="Refrescar datos"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all">
        {/* Mobile View: Cards */}
        <div className="lg:hidden divide-y divide-zinc-800">
          {paginatedData.map((boleto) => {
            const boletosArr = boleto.numero_ticket
              ? boleto.numero_ticket.toString().split(", ")
              : boleto.numero_boleto
                ? boleto.numero_boleto.split(", ")
                : [];
            const cantidad = boletosArr.length;

            return (
              <div key={boleto.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                      Folio
                    </p>
                    <p className="font-mono font-black text-lg text-white">
                      {boleto.folio}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      boleto.estado === "pagado"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : boleto.estado === "pendiente"
                          ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                          : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {boleto.estado}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                      Comprador
                    </p>
                    <p className="font-black text-white text-sm truncate">
                      {boleto.comprador_nombre}
                    </p>
                    <p className="text-zinc-500 text-[10px] truncate">
                      {boleto.comprador_telefono}
                    </p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                      Boletos
                    </p>
                    <button
                      onClick={() =>
                        setModalBoleto({ ...boleto, tickets: boletosArr })
                      }
                      className="flex justify-between items-center w-full bg-zinc-900 hover:bg-emerald-500 hover:text-black p-2 rounded-xl transition-all border border-zinc-800"
                    >
                      <span className="font-black text-xs">
                        {cantidad.toString().padStart(2, "0")} UNDS
                      </span>
                      <span className="text-xs">👁️</span>
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                    Referencia
                  </p>
                  <p className="font-mono text-xs text-zinc-300">
                    {boleto.referencia_pago || "---"}
                  </p>
                </div>

                {boleto.estado === "pendiente" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() =>
                        updateEstado(
                          boleto.id,
                          "pagado",
                          boleto.rifa_id,
                          cantidad,
                        )
                      }
                      disabled={loadingId === boleto.id}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl transition-all disabled:opacity-50 text-sm shadow-lg shadow-emerald-500/10"
                    >
                      {loadingId === boleto.id ? "..." : "Confirmar Pago"}
                    </button>
                    <button
                      onClick={() =>
                        updateEstado(
                          boleto.id,
                          "vencido",
                          boleto.rifa_id,
                          cantidad,
                        )
                      }
                      disabled={loadingId === boleto.id}
                      className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-xl transition-all"
                    >
                      Vencer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto overflow-y-hidden custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50">
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Folio
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Comprador
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Rifa
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Boletos
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Referencia
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">
                  Estado
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paginatedData.map((boleto) => {
                const boletosArr = boleto.numero_ticket
                  ? boleto.numero_ticket.toString().split(", ")
                  : boleto.numero_boleto
                    ? boleto.numero_boleto.split(", ")
                    : [];
                const cantidad = boletosArr.length;

                return (
                  <tr
                    key={boleto.id}
                    className="hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-6 py-6 font-mono font-black text-emerald-500 text-base">
                      {boleto.folio}
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-black text-white text-sm uppercase leading-tight">
                        {boleto.comprador_nombre}
                      </p>
                      <p className="text-zinc-500 text-[10px] font-bold mt-1 tracking-wider">
                        {boleto.comprador_telefono}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-zinc-400 text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
                      {boleto.rifas?.nombre || "N/A"}
                    </td>
                    <td className="px-6 py-6">
                      <button
                        onClick={() =>
                          setModalBoleto({ ...boleto, tickets: boletosArr })
                        }
                        className="flex items-center gap-2 group/btn"
                      >
                        <span className="bg-zinc-800 text-emerald-500 px-3 py-1.5 rounded-xl font-mono font-black border border-zinc-700 group-hover/btn:bg-emerald-500 group-hover/btn:text-black transition-all text-xs">
                          {cantidad.toString().padStart(2, "0")} UNDS
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/btn:text-white transition-colors">
                          👁️
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-6 text-zinc-500 font-mono text-[10px] tracking-tight">
                      {boleto.referencia_pago || "---"}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          boleto.estado === "pagado"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : boleto.estado === "pendiente"
                              ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                              : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {boleto.estado}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right font-black">
                      <div className="flex justify-end gap-2">
                        {boleto.estado === "pendiente" && (
                          <>
                            <button
                              onClick={() =>
                                updateEstado(
                                  boleto.id,
                                  "pagado",
                                  boleto.rifa_id,
                                  cantidad,
                                )
                              }
                              disabled={loadingId === boleto.id}
                              className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:scale-95"
                            >
                              {loadingId === boleto.id ? "..." : "Confirmar"}
                            </button>
                            <button
                              onClick={() =>
                                updateEstado(
                                  boleto.id,
                                  "vencido",
                                  boleto.rifa_id,
                                  cantidad,
                                )
                              }
                              disabled={loadingId === boleto.id}
                              className="p-2.5 bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-500/20"
                              title="Vencer"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        {boleto.estado === "pagado" && (
                          <span className="text-emerald-500 text-xl font-black">
                            ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {paginatedData.length === 0 && (
          <div className="px-6 py-20 text-center space-y-4">
            <span className="text-4xl text-zinc-700">🔍</span>
            <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">
              No se encontraron boletos con estos filtros.
            </p>
          </div>
        )}

        {/* Improved Pagination Controls */}
        <footer className="bg-zinc-900/50 border-t border-zinc-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Mostrar
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-black text-white focus:outline-none"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-black text-xs disabled:opacity-30 transition-all uppercase tracking-widest"
            >
              Anterior
            </button>
            <div className="flex items-center gap-3 px-4">
              <span className="text-zinc-500 text-xs font-black">PÁGINA</span>
              <span className="text-emerald-500 font-black text-sm">
                {currentPage}
              </span>
              <span className="text-zinc-500 text-xs font-black">
                DE {totalPages || 1}
              </span>
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-black text-xs disabled:opacity-30 transition-all uppercase tracking-widest"
            >
              Siguiente
            </button>
          </div>

          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {filteredData.length} Resultados totales
          </div>
        </footer>
      </div>

      {/* Modal de Boletos */}
      {modalBoleto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setModalBoleto(null)}
          ></div>
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  Boletos del Folio {modalBoleto.folio}
                </h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Comprador: {modalBoleto.comprador_nombre}
                </p>
              </div>
              <button
                onClick={() => setModalBoleto(null)}
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"
              >
                ✕
              </button>
            </header>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {modalBoleto.tickets?.map((ticket, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-center"
                  >
                    <span className="text-emerald-500 font-mono font-black text-sm">
                      #{ticket.toString().padStart(4, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <footer className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                Total
              </span>
              <span className="text-emerald-500 font-black text-xl">
                {modalBoleto.tickets?.length}{" "}
                <span className="text-xs text-zinc-500 uppercase tracking-widest">
                  Boletos
                </span>
              </span>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
