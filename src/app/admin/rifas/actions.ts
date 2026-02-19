// src/app/admin/rifas/actions.ts
'use server'
import { supabase } from '../../../lib/supabase' 
import { uploadImage } from '../../../lib/cloudinary'
import { revalidatePath } from 'next/cache'

export async function crearRifa(formData: FormData) {
    const file = formData.get('imagen') as File
    const nombre = formData.get('nombre') as string
    
    // Generar un slug básico (ej: "Rifa iPhone" -> "rifa-iphone-12345")
    const slug = `${nombre.toLowerCase().replace(/ /g, '-')}-${Math.floor(Math.random() * 1000)}`;

    try {
        const imageUrl = await uploadImage(file)

        const { data, error } = await supabase.from('rifas').insert([{
            nombre: nombre,
            descripcion: formData.get('descripcion'),
            precio_boleto: parseFloat(formData.get('precio') as string),
            total_boletos: parseInt(formData.get('total') as string),
            imagen_url: imageUrl,
            whatsapp_vendedor: formData.get('whatsapp'),
            nombre_banco: formData.get('banco'),
            numero_cuenta: formData.get('cuenta'),
            titular_cuenta: formData.get('titular'),
            estado: 'activa',
            slug: slug // Añadimos el slug para evitar errores de BD
        }])

        if (error) throw error

        revalidatePath('/admin/rifas')
        return { success: true }
    } catch (err: any) { // Cambia 'error' por 'err' para no confundir con la variable de supabase
    console.error('Error detallado:', err)
    return { success: false, error: err.message || "No se pudo crear la rifa" }
    }
}