# PortalMultiverso

Aplicación móvil en **React Native 0.80.2** (Hermes / New Architecture) que consume la API pública de *Rick & Morty* para listar personajes, aplicar filtros y ver un detalle con notas **offline‑first**. El proyecto está diseñado con arquitectura modular y desacoplada de la UI final, priorizando mantenibilidad, rendimiento y un flujo de datos claro entre **RTK Query** (caché remota) y **Realm** (estado local duradero).

> Gestor de paquetes: **npm**

---

## Descripción general

PortalMultiverso entrega una app funcional que:
- Lista personajes con filtros por **nombre**, **estado** y **especie**, con **paginación incremental**.
- Abre un **detalle** de personaje con su información y episodios.
- Permite crear/editar/borrar **notas locales por personaje**, con **cola de sincronización** (Outbox) que actualiza el estado de cada nota entre `pending` y `synced` al recuperar la conectividad.
- Soporta **deep links** para abrir directamente la búsqueda o el detalle.

Todo el código está organizado por **dominios/features** y desacoplado de estilos y vistas finales.

---

## Tecnologías principales

- **React Native 0.80.2** (Hermes, New Architecture) — base moderna con mejoras de rendimiento y compatibilidad con Android API 35.
- **React Navigation v6** — navegación por Tabs/Stack y soporte de deep links declarativos.
- **Redux Toolkit + RTK Query** — estado de UI y **caché remota** con revalidación/`refetchOnFocus`/`refetchOnReconnect`.
- **Realm + @realm/react** — base de datos local **offline‑first** para entidades de negocio (notas) con reactividad en tiempo real.
- **react‑native‑gesture‑handler** y **react‑native‑reanimated 3** — gestos y animaciones fluidas (microinteracciones y transiciones).
- **@react‑native‑community/netinfo** — estado de red para coordinar la sincronización del Outbox.


---

**Reglas de flujo de datos**
- **Realm**: entidad `Note` (durable/offline). `OutboxEntry` registra operaciones para sincronizar (create/update/delete).
- **RTK Query**: lectura remota y caché de la API (personajes y episodios).
- **Redux slice**: estado de **UI** (filtros: nombre, estado, especie). No se guardan grandes entidades aquí.

---

## Características implementadas

### Listado de personajes
- Filtros: **nombre**, **estado** (`alive|dead|unknown`) y **especie** (texto libre).
- **Paginación incremental** con prevención de duplicados.
- **Pull‑to‑refresh** para mantener datos frescos.
- Los filtros se conservan al navegar y volver (estado de UI en Redux).

### Detalle de personaje
- Información del personaje + lista de episodios (RTK Query).
- Sección **Notas** con animación de expandir/contraer usando Reanimated:
  - **Contraída**: muestra solo la **última nota**.
  - **Expandida**: input para agregar nota y **todas** las notas.
- CRUD de notas:
  - Crear/editar/borrar cambia la nota a `pending` y encola la operación.
  - Al sincronizar con el endpoint mock, cambia a `synced`.

### Offline‑first y Outbox
  - Se ejecuta cuando cambia el **Outbox** o cambia la **conectividad** (NetInfo).
  - Aplica backoff simple y `MAX_ATTEMPTS = 5`. Si se agota, guarda `lastError` para diagnóstico.
  - Usa JSONPlaceholder como **mock** de escritura (marca `synced` al `ok` del endpoint).

### Deep links
- **Esquema**: `portalmultiverso://`
- **Rutas soportadas**:
  - `portalmultiverso://character/:id` — abre el detalle. El parser inyecta la ruta de lista para conservar la UX de “volver”.  
  - `portalmultiverso://search?query=<texto>` — aplica el filtro `name` y muestra la lista.
- Implementado en `src/app/navigation/index.tsx` (`linking` + `getStateFromPath`).

**Ejemplos**
- iOS (simulador):
  ```navegador
  "portalmultiverso://character/42"
  "portalmultiverso://search?query=Morty"
  ```
- Android (emulador/dispositivo):
  ```bash
  adb shell am start -W -a android.intent.action.VIEW -d "portalmultiverso://character/1" com.portalmultiverso
  adb shell am start -W -a android.intent.action.VIEW -d "portalmultiverso://search?query=Morty" com.portalmultiverso
  ```

---

## Instalación y ejecución

### Requisitos
- Node 18+
- Xcode 15+ / Android SDK 35
- CocoaPods (si usas iOS): `gem install cocoapods`

### Pasos
```bash
# 1) Dependencias
npm install

# 2) iOS
npx pod-install
npm run ios

# 3) Android
npm run android
```

---
