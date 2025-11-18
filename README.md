# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9e67009c-e337-4fc5-a8be-5a8284ca8619

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9e67009c-e337-4fc5-a8be-5a8284ca8619) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9e67009c-e337-4fc5-a8be-5a8284ca8619) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Supabase (Postgres)

Si vas a usar Supabase como backend/Postgres, sigue estos pasos:

- Añade las variables de entorno en un archivo `.env` (puedes copiar `.env.example`). Usa `VITE_SUPABASE_PROJECT_ID` y `VITE_SUPABASE_PUBLISHABLE_KEY` junto a `VITE_SUPABASE_URL`.
- Instala la dependencia (`@supabase/supabase-js`) si no está instalada.

Ejemplo mínimo de uso en el frontend:

```ts
// src/lib/supabase.ts
import { supabase } from "./lib/supabase";

// Obtener filas de ejemplo
const { data, error } = await supabase.from('tu_tabla').select('*').limit(10);
if (error) console.error(error);
console.log(data);
```

Exportamos el cliente ya inicializado en `src/lib/supabase.ts` y lo importas donde lo necesites.
