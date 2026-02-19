// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
        headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
        cookies: {
            get(name: string) {
            return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
                request: {
                headers: request.headers,
                },
            })
            response.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
                    // AQUÍ ESTABA EL ERROR: Usamos '' porque value no existe en remove
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
        },
        }
    )

    // Obtenemos la sesión del usuario
    const { data: { user } } = await supabase.auth.getUser()

    // PROTECCIÓN DE RUTAS: 
    // Si la ruta comienza con /admin y no hay usuario, redirigir a login
    if (request.nextUrl.pathname.startsWith('/admin') && !user) {
        // Evitamos el bucle infinito si ya está en la página de login
        if (request.nextUrl.pathname !== '/admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
        * Coincidir con todas las rutas excepto:
        * - api (rutas de API)
        * - _next/static (archivos estáticos)
        * - _next/image (optimización de imágenes)
        * - favicon.ico (archivo de icono)
        */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}