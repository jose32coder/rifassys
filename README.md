Para que tu archivo README.md refleje correctamente el sistema de rifas que estamos construyendo según la Propuesta Técnica, he ajustado el contenido para que incluya el stack tecnológico, las instrucciones de configuración y la estructura del proyecto.

Copia y pega este contenido en tu archivo README.md:

🎟️ Plataforma de Rifas MX — Sistema de Sorteos
Este es un sistema moderno para la gestión y venta de boletos de rifas en línea, optimizado para el mercado mexicano con pagos vía transferencia y notificaciones por WhatsApp.

🚀 Stack Tecnológico
Basado en la arquitectura definida en la propuesta técnica:
+1

Frontend/Backend: Next.js 14 (App Router, JavaScript).
+1

Base de Datos: Supabase (PostgreSQL + Realtime).
+2

Imágenes: Cloudinary (CDN para fotos de premios y comprobantes).
+1

Estilos: Tailwind CSS (Responsive & Dark Mode).
+1

Notificaciones: WhatsApp Business Link (wa.me).
+1

⚙️ Configuración del Entorno

Variables de Entorno: Crea un archivo .env.local en la raíz del proyecto y añade tus credenciales:
+1

Fragmento de código

# Supabase

NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Cloudinary

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
Instalación:

Bash
npm install
Ejecución en Desarrollo:

Bash
npm run dev
📂 Estructura del Proyecto
El proyecto sigue el plan de implementación por fases:

/app: Rutas del sitio (Catálogo, Compra, Verificador y Admin).

/components: Componentes reutilizables como RifaCard y formularios.

/lib: Clientes de Supabase, Cloudinary y lógica de WhatsApp.

/api: Endpoints para asignación aleatoria de números y verificación.

🛠️ Flujo de Operación

Administración: El administrador crea una rifa desde el panel.

Compra: El sistema asigna un número aleatorio (1-9999) y genera un folio único.
+2

Pago: El comprador sube su comprobante y notifica al vendedor por WhatsApp automáticamente.
+1

Validación: El administrador confirma el pago en el panel para que el boleto sea válido públicamente.

🌐 Despliegue
El proyecto está listo para ser desplegado en Vercel siguiendo la integración continua desde GitHub.
