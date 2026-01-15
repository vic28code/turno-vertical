# Project Setup

## Requisitos

Asegúrate de tener instalado:

- Node.js (recomendado vía nvm)
- npm

Guía para instalar Node.js con nvm:  
https://github.com/nvm-sh/nvm#installing-and-updating

---

## Instalación y ejecución local

Sigue estos pasos para levantar el proyecto en tu entorno local:

# Clonar el repositorio
git clone <YOUR_GIT_URL>

# Entrar al directorio del proyecto
cd <YOUR_PROJECT_NAME>

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev

## Tecnologías utilizadas

Este proyecto está construido con:

- **Vite**
- **TypeScript**
- **React**
- **shadcn/ui**
- **Tailwind CSS**

## Dependencias adicionales

Para que el proyecto funcione correctamente, instala Supabase:

npm install @supabase/supabase-js

# Estructura Recomendada

src/
├─ components/
├─ lib/
├─ pages/
├─ styles/
└─ main.tsx
