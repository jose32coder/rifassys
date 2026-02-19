'use client'
import { crearRifa } from './actions'
import { useState } from 'react'

export default function NuevaRifaPage() {
    const [loading, setLoading] = useState(false)

    async function clientAction(formData: FormData) {
        setLoading(true)
        const result = await crearRifa(formData)
        setLoading(false)
        
        if (result.success) {
        alert("¡Rifa creada exitosamente!")
        window.location.reload() // Refrescar para limpiar
        } else {
        alert("Error: " + result.error)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurar Nueva Rifa 🎟️</h1>
        
        <form action={clientAction} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Premio</label>
                <input name="nombre" type="text" required className="mt-1 w-full p-2 border rounded-md" placeholder="Ej. iPhone 15 Pro Max" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Imagen del Premio</label>
                <input name="imagen" type="file" accept="image/*" required className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea name="descripcion" rows={3} className="mt-1 w-full p-2 border rounded-md" placeholder="Detalles del sorteo, condiciones, etc."></textarea>
            </div>

            {/* Precios y Cantidad */}
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Precio por Boleto ($)</label>
                <input name="precio" type="number" step="0.01" required className="mt-1 w-full p-2 border rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Total de Boletos</label>
                <input name="total" type="number" required className="mt-1 w-full p-2 border rounded-md" placeholder="Ej. 100" />
            </div>
            </div>

            {/* Datos de Pago y Contacto */}
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2 text-sm uppercase">Datos para recibir pagos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="banco" placeholder="Nombre del Banco" className="p-2 border rounded-md" />
                <input name="cuenta" placeholder="Número de Cuenta / CLABE" className="p-2 border rounded-md" />
                <input name="titular" placeholder="Nombre del Titular" className="p-2 border rounded-md" />
                <input name="whatsapp" placeholder="WhatsApp (Ej. 521234567890)" required className="p-2 border rounded-md" />
            </div>
            </div>

            <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md text-white font-bold transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
            {loading ? 'Subiendo datos e imagen...' : 'Publicar Rifa Ahora'}
            </button>
        </form>
        </div>
    )
}