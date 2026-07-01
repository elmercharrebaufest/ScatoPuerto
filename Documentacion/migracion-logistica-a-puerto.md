# Migración Logística → Puerto: Pantallas de Operaciones

**Rama:** `feature/migracion-balanzadas/PSP-727-con-plan-tickets-731-a-735`  
**Fecha:** 2025  
**Tickets relacionados:** PSP-727, PSP-731 a PSP-735

---

## Resumen

Este documento registra la migración de pantallas operativas desde la solución **Scato Logística** (`Molinos.Scato.Web`) hacia la solución **Scato Puerto** (`Molinos.Scato.WebPuertoApi` + `Molinos.Scato.WebPuerto`).

> **Importante:** No se eliminó ni modificó ningún archivo en la solución de Logística. Todos los controllers, views y modelos de Logística permanecen intactos como referencia funcional.

---

## Pantallas migradas

### 1. Embarques (Operaciones Puerto)

| Concepto | Archivo origen (Logística) | Equivalente en Puerto |
|---|---|---|
| Controller MVC | `Molinos.Scato.Web/Controllers/OperacionesPuertoController.cs` | Ya existía en Puerto (MVC) |
| View principal | `Molinos.Scato.Web/Views/OperacionesPuerto/Index.cshtml` | Reemplazada por Angular |
| View listado | `Molinos.Scato.Web/Views/OperacionesPuerto/Listar.cshtml` | Componente Angular |
| **API Controller nuevo** | — | `Molinos.Scato.WebPuertoApi/Controllers/OperacionesPuertoController.cs` |
| **Módulo Angular** | — | `Molinos.Scato.WebPuerto/src/app/modulos/puerto-logistica/embarques/` |
| **Componente principal** | — | `embarques.component.ts / .html` |
| **Servicio Angular** | — | `shared/servicios/puerto-logistica/operaciones-puerto.service.ts` |
| Permiso backend | `PermisosScato.Embarques_Ver` | `Molinos.Scato.Dominio/Seguridad/PermisosScato.cs` |
| Permiso frontend | `PermisosScato.Embarques_Ver` | `shared/enums/permisos-scato.ts` |
| Ruta Angular | — | `/puerto-logistica/embarques` |
| Menú sidebar | — | `Puerto - Logística > Embarques` |

**Funcionalidad:** Lista paginada de cargas (balanzadas) con filtros por vapor, bodega, exportador, material y fechas. Permite ver detalle de balanzadas y enviar registros a SAP.

**Endpoints API creados:**
- `GET api/OperacionesPuerto/ListarCargas` — lista paginada con `CargaFiltroDto`
- `GET api/OperacionesPuerto/ListarBalanzadas` — balanzadas de una carga
- `GET api/OperacionesPuerto/ObtenerCarga` — detalle de una carga
- `GET api/OperacionesPuerto/TotalEmbarcado` — toneladas totales embarcadas
- `GET api/OperacionesPuerto/BalanzadasFaltantes` — IDs faltantes por rango
- `POST api/OperacionesPuerto/EnviarASap` — envía balanzadas a SAP

---

### 2. Reporte por Turnos (Reporte Pesada Seis Horas)

| Concepto | Archivo origen (Logística) | Equivalente en Puerto |
|---|---|---|
| Controller MVC | `Molinos.Scato.Web/Controllers/ReportePesadaSeisHorasController.cs` | — (no tenía MVC en Puerto) |
| View principal | `Molinos.Scato.Web/Views/ReportePesadaSeisHoras/Index.cshtml` | Reemplazada por Angular |
| Modelo filtro | `Molinos.Scato.Web/Models/FiltroReportePesadaSeisHorasModel.cs` | Parámetros directos en API |
| **API Controller nuevo** | — | `Molinos.Scato.WebPuertoApi/Controllers/ReportePesadaController.cs` |
| **Módulo Angular** | — | `Molinos.Scato.WebPuerto/src/app/modulos/puerto-logistica/reporte-pesada/` |
| **Componente principal** | — | `reporte-pesada.component.ts / .html` |
| **Componente compartido** | — | `shared/componentes/filtro-reporte-pesada/` |
| **Servicio Angular** | — | `shared/servicios/puerto-logistica/reporte-pesada.service.ts` |
| Permiso backend | `PermisosScato.ReportePesada_Ver` | `Molinos.Scato.Dominio/Seguridad/PermisosScato.cs` |
| Permiso frontend | `PermisosScato.ReportePesada_Ver` | `shared/enums/permisos-scato.ts` |
| Ruta Angular | — | `/puerto-logistica/reporte-pesada` |
| Menú sidebar | — | `Puerto - Logística > Reporte por Turnos` |

**Funcionalidad:** Reporte de pesadas agrupadas por turno (0-6 hs, 6-12 hs, 12-18 hs, 18-24 hs) con filtros de fecha, exportador y material.

**Endpoints API creados:**
- `GET api/ReportePesada/Listar` — lista paginada por turno
- `GET api/ReportePesada/ListarExportadores` — combo de exportadores
- `GET api/ReportePesada/ListarMateriales` — combo de materiales

---

### 3. Configuración de Puerto (Balanza Puerto)

| Concepto | Archivo origen (Logística) | Equivalente en Puerto |
|---|---|---|
| Controller MVC | `Molinos.Scato.Web/Controllers/BalanzaPuertoController.cs` | Ya existía en Puerto (MVC) |
| View principal | `Molinos.Scato.Web/Views/BalanzaPuerto/Index.cshtml` | Reemplazada por Angular |
| View crear/modificar | `Molinos.Scato.Web/Views/BalanzaPuerto/Crear.cshtml`, `Modificar.cshtml` | Formulario inline Angular |
| **API Controller nuevo** | — | `Molinos.Scato.WebPuertoApi/Controllers/BalanzaPuertoController.cs` |
| **Módulo Angular** | — | `Molinos.Scato.WebPuerto/src/app/modulos/puerto-logistica/configuracion-puerto/` |
| **Componente principal** | — | `configuracion-puerto.component.ts / .html` |
| **Servicio Angular** | — | `shared/servicios/puerto-logistica/balanza-puerto.service.ts` |
| Permiso backend | `PermisosScato.BalanzaPuerto_Configuracion` | `Molinos.Scato.Dominio/Seguridad/PermisosScato.cs` |
| Permiso frontend | `PermisosScato.BalanzaPuerto_Configuracion` | `shared/enums/permisos-scato.ts` |
| Ruta Angular | — | `/puerto-logistica/configuracion-puerto` |
| Menú sidebar | — | `Puerto - Logística > Configuración de Puerto > Balanzas de Puerto` |

**Funcionalidad:** ABM de balanzas puerto (crear, modificar, eliminar). Campos: código de balanza, código dispositivo, centro, administrativa, offset PLC, intentos de validación.

**Endpoints API creados:**
- `GET api/BalanzaPuerto/Listar` — lista paginada con filtro
- `POST api/BalanzaPuerto/Crear` — crear balanza
- `PUT api/BalanzaPuerto/Modificar` — modificar balanza
- `DELETE api/BalanzaPuerto/Eliminar/{id}` — eliminar balanza

---

### 4. Embarques por Buque

| Concepto | Archivo origen (Logística) | Equivalente en Puerto |
|---|---|---|
| Controller MVC | `Molinos.Scato.Web/Controllers/EmbarquesPorBuquesController.cs` | — (no tenía MVC en Puerto) |
| View principal | `Molinos.Scato.Web/Views/EmbarquesPorBuques/Index.cshtml` | Reemplazada por Angular |
| **API Controller nuevo** | — | `Molinos.Scato.WebPuertoApi/Controllers/EmbarquesPorBuquesController.cs` |
| **Módulo Angular** | — | `Molinos.Scato.WebPuerto/src/app/modulos/puerto-logistica/embarques-por-buques/` |
| **Componente principal** | — | `embarques-por-buques.component.ts / .html` |
| **Componente compartido** | — | `shared/componentes/filtro-cargas/` (reutilizado) |
| **Componente compartido** | — | `shared/componentes/tabla-cargas/` (reutilizado) |
| **Servicio Angular** | — | `shared/servicios/puerto-logistica/embarques-por-buques.service.ts` |
| Permiso backend | `PermisosScato.EmbarquesPorBuques_Ver` | `Molinos.Scato.Dominio/Seguridad/PermisosScato.cs` |
| Permiso frontend | `PermisosScato.EmbarquesPorBuques_Ver` | `shared/enums/permisos-scato.ts` |
| Ruta Angular | — | `/puerto-logistica/embarques-por-buques` |
| Menú sidebar | — | `Puerto - Logística > Embarques por Buque` |

**Funcionalidad:** Lista de embarques agrupados por buque, con porcentaje de carga y comparación de pesos entre balanzadas.

**Endpoints API creados:**
- `GET api/EmbarquesPorBuques/Listar` — lista paginada con `CargaFiltroDto`
- `GET api/EmbarquesPorBuques/ObtenerCarga` — detalle de una carga
- `GET api/EmbarquesPorBuques/TotalEmbarcado` — total embarcado
- `GET api/EmbarquesPorBuques/BalanzadasFaltantes` — IDs faltantes

---

### 5. Etiquetas de Puerto

| Concepto | Archivo origen (Logística) | Equivalente en Puerto |
|---|---|---|
| Controller MVC | `Molinos.Scato.Web/Controllers/EtiquetaPuertoController.cs` | — (no tenía MVC en Puerto) |
| View principal | `Molinos.Scato.Web/Views/EtiquetaPuerto/Listar.cshtml` | Reemplazada por Angular |
| **API Controller nuevo** | — | `Molinos.Scato.WebPuertoApi/Controllers/EtiquetaPuertoController.cs` |
| **Módulo Angular** | — | `Molinos.Scato.WebPuerto/src/app/modulos/puerto-logistica/etiquetas-puerto/` |
| **Componente principal** | — | `etiquetas-puerto.component.ts / .html` |
| **Servicio Angular** | — | `shared/servicios/puerto-logistica/etiqueta-puerto.service.ts` |
| Permiso backend | `PermisosScato.EtiquetaPuerto_Ver` | `Molinos.Scato.Dominio/Seguridad/PermisosScato.cs` |
| Permiso frontend | `PermisosScato.EtiquetaPuerto_Ver` | `shared/enums/permisos-scato.ts` |
| Ruta Angular | — | `/puerto-logistica/etiquetas-puerto` |
| Menú sidebar | — | `Puerto - Logística > Etiquetas de Puerto` |

**Funcionalidad:** Visualización y gestión de etiquetas de puerto cargadas desde Excel. Campos: vapor, cargador, mercadería, destino, kg, n° de lote, bodega, control, fecha.

**Endpoints API creados:**
- `GET api/EtiquetaPuerto/Listar` — lista paginada por usuario
- `POST api/EtiquetaPuerto/Guardar` — guardar una etiqueta
- `POST api/EtiquetaPuerto/GuardarLote` — guardar lote desde Excel
- `DELETE api/EtiquetaPuerto/Eliminar/{usuarioId}` — eliminar etiquetas del usuario

---

## Componentes compartidos creados

| Componente | Ruta | Usado en |
|---|---|---|
| `FiltroCargasComponent` | `shared/componentes/filtro-cargas/` | Embarques, Embarques por Buque |
| `TablaCargasComponent` | `shared/componentes/tabla-cargas/` | Embarques, Embarques por Buque |
| `FiltroReportePesadaComponent` | `shared/componentes/filtro-reporte-pesada/` | Reporte por Turnos |

---

## Archivos modificados en la solución Puerto

### Backend (Molinos.Scato.WebPuertoApi)
- `Controllers/OperacionesPuertoController.cs` — **creado**
- `Controllers/BalanzaPuertoController.cs` — **creado**
- `Controllers/ReportePesadaController.cs` — **creado**
- `Controllers/EmbarquesPorBuquesController.cs` — **creado**
- `Controllers/EtiquetaPuertoController.cs` — **creado**

### Dominio (Molinos.Scato.Dominio)
- `Seguridad/PermisosScato.cs` — **modificado** (5 valores nuevos al enum)
- `Recursos/Textos.resx` — **modificado** (5 claves nuevas)
- `Recursos/Textos.Designer.cs` — **modificado** (5 propiedades nuevas)

### Base de datos (Molinos.Scato.Database)
- `Scripts/Post-Deployment/Datos Base.sql` — **modificado** (INSERTs idempotentes en `ADPuertoPermisos` y `ADPuertoRolesPermisos`)

### Frontend Angular (Molinos.Scato.WebPuerto)
- `src/app/app-routing.module.ts` — **modificado** (1 ruta lazy-load nueva: `puerto-logistica`)
- `src/app/shared/enums/permisos-scato.ts` — **modificado** (5 valores nuevos)
- `src/app/shared/componentes/shared-components.module.ts` — **modificado** (3 componentes nuevos declarados/exportados)
- `src/app/shared/componentes/layout/layout.component.html` — **modificado** (sección "Puerto - Logística" en sidebar con rutas `/puerto-logistica/...`)
- `src/app/shared/componentes/layout/layout.component.ts` — **modificado** (5 rutas en `goHome()` bajo `/puerto-logistica/...`)
- `src/app/shared/servicios/puerto-logistica/operaciones-puerto.service.ts` — **creado**
- `src/app/shared/servicios/puerto-logistica/balanza-puerto.service.ts` — **creado**
- `src/app/shared/servicios/puerto-logistica/reporte-pesada.service.ts` — **creado**
- `src/app/shared/servicios/puerto-logistica/embarques-por-buques.service.ts` — **creado**
- `src/app/shared/servicios/puerto-logistica/etiqueta-puerto.service.ts` — **creado**
- `src/app/shared/componentes/filtro-cargas/` — **creado** (ts, html, css)
- `src/app/shared/componentes/tabla-cargas/` — **creado** (ts, html, css)
- `src/app/shared/componentes/filtro-reporte-pesada/` — **creado** (ts, html, css)
- `src/app/modulos/puerto-logistica/puerto-logistica.module.ts` — **creado** (módulo wrapper)
- `src/app/modulos/puerto-logistica/puerto-logistica-routing.module.ts` — **creado** (5 rutas lazy hijas con `RoleGuard`)
- `src/app/modulos/puerto-logistica/embarques/` — **creado** (module, routing, component)
- `src/app/modulos/puerto-logistica/reporte-pesada/` — **creado** (module, routing, component)
- `src/app/modulos/puerto-logistica/configuracion-puerto/` — **creado** (module, routing, component)
- `src/app/modulos/puerto-logistica/embarques-por-buques/` — **creado** (module, routing, component)
- `src/app/modulos/puerto-logistica/etiquetas-puerto/` — **creado** (module, routing, component)

---

## Permisos y roles de seguridad

| Permiso | Roles con acceso |
|---|---|
| `Embarques_Ver` | Tableristas, Coordinacion, Comex, AdmFacturacion, Sistemas |
| `ReportePesada_Ver` | Tableristas, Coordinacion, Comex, AdmFacturacion, Sistemas |
| `BalanzaPuerto_Configuracion` | Tableristas, Supervisores, Sistemas |
| `EmbarquesPorBuques_Ver` | Tableristas, Coordinacion, Comex, AdmFacturacion, Sistemas |
| `EtiquetaPuerto_Ver` | Tableristas, Coordinacion, Sistemas |

---

## Menú lateral — sección "Puerto - Logística"

```
Puerto - Logística
├── Embarques                    → /puerto-logistica/embarques
├── Reporte por Turnos           → /puerto-logistica/reporte-pesada
├── Configuración de Puerto (▶)
│   └── Balanzas de Puerto       → /puerto-logistica/configuracion-puerto
├── Embarques por Buque          → /puerto-logistica/embarques-por-buques
└── Etiquetas de Puerto          → /puerto-logistica/etiquetas-puerto
```

Cada ítem del menú está protegido por `*ngIf='tienePermiso("X")'` en `layout.component.html`.

---

## Archivos de Logística referenciados (NO modificados)

| Archivo | Propósito |
|---|---|
| `Molinos.Scato.Web/Controllers/OperacionesPuertoController.cs` | Referencia funcional |
| `Molinos.Scato.Web/Controllers/BalanzaPuertoController.cs` | Referencia funcional |
| `Molinos.Scato.Web/Controllers/ReportePesadaSeisHorasController.cs` | Referencia funcional |
| `Molinos.Scato.Web/Controllers/EmbarquesPorBuquesController.cs` | Referencia funcional |
| `Molinos.Scato.Web/Controllers/EtiquetaPuertoController.cs` | Referencia funcional |
| `Molinos.Scato.Web/Views/OperacionesPuerto/` | Referencia de UI |
| `Molinos.Scato.Web/Views/BalanzaPuerto/` | Referencia de UI |
| `Molinos.Scato.Web/Views/ReportePesadaSeisHoras/` | Referencia de UI |
| `Molinos.Scato.Web/Views/EmbarquesPorBuques/` | Referencia de UI |
| `Molinos.Scato.Web/Views/EtiquetaPuerto/` | Referencia de UI |
| `Molinos.Scato.Web/Models/FiltroReportePesadaSeisHorasModel.cs` | Referencia de modelo |
| `Molinos.Scato.Dominio/Dto/BalanzaPuertoDto.cs` | DTO reutilizado |
| `Molinos.Scato.Dominio/Dto/ImpEtiquetaPuertoDto.cs` | DTO reutilizado |
| `Molinos.Scato.Dominio/Dto/CargaFiltroDto.cs` | DTO reutilizado |
| `Molinos.Scato.Dominio/Dto/ReportePesadaSeisHorasDto.cs` | DTO reutilizado |
| `Molinos.Scato.Dominio/Comandos/CrearBalanzaPuerto.cs` | Comando reutilizado |
| `Molinos.Scato.Dominio/Comandos/ModificarBalanzaPuerto.cs` | Comando reutilizado |
| `Molinos.Scato.Dominio/Comandos/EliminarBalanzaPuerto.cs` | Comando reutilizado |
| `Molinos.Scato.Dominio/Comandos/GuardarEtiquetaPuerto.cs` | Comando reutilizado |
| `Molinos.Scato.Dominio/Comandos/EliminarEtiquetaPuerto.cs` | Comando reutilizado |
