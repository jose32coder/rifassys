// src/lib/cloudinary.ts
export async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    // ELIMINA la línea fija y deja solo la del .env
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!res.ok) {
        const errorData = await res.json();
        console.error('Error Cloudinary:', errorData);
        throw new Error('Error al subir la imagen a Cloudinary');
    }

    const data = await res.json();
    return data.secure_url;
}