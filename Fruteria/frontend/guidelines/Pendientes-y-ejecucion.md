# Pendientes y guía de ejecución

## Lo que hace falta

- Tener Node.js y pnpm instalados.
- Abrir la carpeta correcta del proyecto: `Fruteria/frontend`.
- Instalar dependencias con `pnpm install`.
- Verificar que exista `package.json` dentro de `frontend`.
- Corregir cualquier error de dependencias si `pnpm dev` falla.
- Mantener el entorno limpio de `package-lock.json` si se usa pnpm.
- Levantar el servidor de desarrollo para ver la interfaz en el navegador.

## Cómo ejecutar la app para ver la interfaz

1. Abre una terminal en VS Code.
2. Entra a la carpeta del frontend:

```powershell
cd "C:\Users\Alanc\OneDrive\Desktop\C#\FruteriaAxel\Fruteria\frontend"
```

3. Instala dependencias:

```powershell
pnpm install
```

4. Inicia la app:

```powershell
pnpm dev
```

5. Abre la URL que te muestre Vite, normalmente:

```text
http://localhost:5173/
```

## Si aparece error

- Si dice que no encuentra `package.json`, estás en la carpeta equivocada.
- Si falla por dependencias, vuelve a ejecutar `pnpm install` dentro de `frontend`.
- Si sigue fallando, revisa el mensaje exacto y compártelo para corregirlo.
