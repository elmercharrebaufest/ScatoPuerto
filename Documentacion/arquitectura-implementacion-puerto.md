# Arquitectura e Implementación — Puerto Logística

**Rama:** `feature/migracion-balanzadas/PSP-727-con-plan-tickets-731-a-735`

---

## 1. Endpoints de la Web API (Molinos.Scato.WebPuertoApi)

### OperacionesPuertoController

| Método | Ruta | Permiso requerido | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `api/OperacionesPuerto/ListarCargas` | `Embarques_Ver` | `[FromUri] CargaFiltroDto filtro`, `int pagina`, `string ordenarPor`, `DirOrden dirOrden` | `ListaPaginada<CargaDto>` |
| GET | `api/OperacionesPuerto/ListarBalanzadas` | `Embarques_Ver` | `int id`, `int? idFin`, `string numeroBalanza`, `bool? enviado`, `int pagina`, `string ordenarPor`, `DirOrden dirOrden` | `ListaPaginada<BalanzadaDto>` |
| GET | `api/OperacionesPuerto/ObtenerCarga` | `Embarques_Ver` | `int id`, `string numeroBalanza` | `CargaDto` |
| GET | `api/OperacionesPuerto/TotalEmbarcado` | `Embarques_Ver` | `int cargaInicialId`, `string cargaInicialNumeroBalanza` | `int` |
| GET | `api/OperacionesPuerto/BalanzadasFaltantes` | `Embarques_Ver` | `int id`, `int idFin`, `string numeroBalanza` | `IEnumerable<int>` |
| POST | `api/OperacionesPuerto/EnviarASap` | `Embarques_Ver` | `[FromBody] EnviarLecturaBalanzadaTransmisionASap` | `200 OK` / `500 Error` |

### BalanzaPuertoController

| Método | Ruta | Permiso requerido | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `api/BalanzaPuerto/Listar` | `BalanzaPuerto_Configuracion` | `string filtro`, `int pagina` | `ListaPaginada<BalanzaPuertoDto>` |
| POST | `api/BalanzaPuerto/Crear` | `BalanzaPuerto_Configuracion` | `[FromBody] BalanzaPuertoDto` | `200 OK` / `500 Error` |
| PUT | `api/BalanzaPuerto/Modificar` | `BalanzaPuerto_Configuracion` | `[FromBody] BalanzaPuertoDto` | `200 OK` / `500 Error` |
| DELETE | `api/BalanzaPuerto/Eliminar/{id}` | `BalanzaPuerto_Configuracion` | `int id` | `200 OK` / `500 Error` |

### ReportePesadaController

| Método | Ruta | Permiso requerido | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `api/ReportePesada/Listar` | `ReportePesada_Ver` | `DateTime fechaDesde`, `DateTime fechaHasta`, `int? exportadorId`, `int? materialId`, `int pagina` | `ListaPaginada<ReportePesadaSeisHorasDto>` |
| GET | `api/ReportePesada/ListarExportadores` | `ReportePesada_Ver` | — | `IList<ExportadorDto>` |
| GET | `api/ReportePesada/ListarMateriales` | `ReportePesada_Ver` | — | `IList<MaterialPuertoDto>` |

### EmbarquesPorBuquesController

| Método | Ruta | Permiso requerido | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `api/EmbarquesPorBuques/Listar` | `EmbarquesPorBuques_Ver` | `[FromUri] CargaFiltroDto filtro`, `int pagina`, `string ordenarPor`, `DirOrden dirOrden` | `ListaPaginada<CargaDto>` |
| GET | `api/EmbarquesPorBuques/ObtenerCarga` | `EmbarquesPorBuques_Ver` | `int id`, `string numeroBalanza` | `CargaDto` |
| GET | `api/EmbarquesPorBuques/TotalEmbarcado` | `EmbarquesPorBuques_Ver` | `int cargaInicialId`, `string cargaInicialNumeroBalanza` | `int` |
| GET | `api/EmbarquesPorBuques/BalanzadasFaltantes` | `EmbarquesPorBuques_Ver` | `int id`, `int idFin`, `string numeroBalanza` | `IEnumerable<int>` |

### EtiquetaPuertoController

| Método | Ruta | Permiso requerido | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `api/EtiquetaPuerto/Listar` | `EtiquetaPuerto_Ver` | `int usuarioId`, `int pagina` | `ListaPaginada<ImpEtiquetaPuertoDto>` |
| POST | `api/EtiquetaPuerto/Guardar` | `EtiquetaPuerto_Ver` | `[FromBody] ImpEtiquetaPuertoDto` | `200 OK` / `500 Error` |
| POST | `api/EtiquetaPuerto/GuardarLote` | `EtiquetaPuerto_Ver` | `[FromBody] List<ImpEtiquetaPuertoDto>` | `200 OK` / `500 Error` |
| DELETE | `api/EtiquetaPuerto/Eliminar/{usuarioId}` | `EtiquetaPuerto_Ver` | `int usuarioId` | `200 OK` / `500 Error` |

---

## 2. Servicios Angular

| Servicio | Método | URL | Parámetros | Retorna |
|---|---|---|---|---|
| `OperacionesPuertoService` | `listarCargas(filtro, pagina, ordenarPor, dirOrden)` | `OperacionesPuerto/ListarCargas` | HttpParams desde filtro | `Observable<any>` |
| `OperacionesPuertoService` | `listarBalanzadas(id, idFin, numBalanza, enviado, pagina)` | `OperacionesPuerto/ListarBalanzadas` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `obtenerCarga(id, numBalanza)` | `OperacionesPuerto/ObtenerCarga` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `totalEmbarcado(id, numBalanza)` | `OperacionesPuerto/TotalEmbarcado` | HttpParams | `Observable<number>` |
| `OperacionesPuertoService` | `balanzadasFaltantes(id, idFin, numBalanza)` | `OperacionesPuerto/BalanzadasFaltantes` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `enviarASap(comando)` | `OperacionesPuerto/EnviarASap` | body JSON | `Observable<any>` |
| `BalanzaPuertoService` | `listar(filtro, pagina)` | `BalanzaPuerto/Listar` | HttpParams | `Observable<any>` |
| `BalanzaPuertoService` | `crear(dto)` | `BalanzaPuerto/Crear` | body JSON | `Observable<any>` |
| `BalanzaPuertoService` | `modificar(dto)` | `BalanzaPuerto/Modificar` | body JSON | `Observable<any>` |
| `BalanzaPuertoService` | `eliminar(id)` | `BalanzaPuerto/Eliminar/{id}` | — | `Observable<any>` |
| `ReportePesadaService` | `listar(fechaDesde, fechaHasta, exportadorId, materialId, pagina)` | `ReportePesada/Listar` | HttpParams | `Observable<any>` |
| `ReportePesadaService` | `listarExportadores()` | `ReportePesada/ListarExportadores` | — | `Observable<any[]>` |
| `ReportePesadaService` | `listarMateriales()` | `ReportePesada/ListarMateriales` | — | `Observable<any[]>` |
| `EmbarquesPorBuquesService` | `listar(filtro, pagina, ordenarPor, dirOrden)` | `EmbarquesPorBuques/Listar` | HttpParams | `Observable<any>` |
| `EmbarquesPorBuquesService` | `obtenerCarga(id, numBalanza)` | `EmbarquesPorBuques/ObtenerCarga` | HttpParams | `Observable<any>` |
| `EmbarquesPorBuquesService` | `totalEmbarcado(id, numBalanza)` | `EmbarquesPorBuques/TotalEmbarcado` | HttpParams | `Observable<number>` |
| `EmbarquesPorBuquesService` | `balanzadasFaltantes(id, idFin, numBalanza)` | `EmbarquesPorBuques/BalanzadasFaltantes` | HttpParams | `Observable<any>` |
| `EtiquetaPuertoService` | `listar(usuarioId, pagina)` | `EtiquetaPuerto/Listar` | HttpParams | `Observable<any>` |
| `EtiquetaPuertoService` | `guardar(etiqueta)` | `EtiquetaPuerto/Guardar` | body JSON | `Observable<any>` |
| `EtiquetaPuertoService` | `guardarLote(etiquetas)` | `EtiquetaPuerto/GuardarLote` | body JSON | `Observable<any>` |
| `EtiquetaPuertoService` | `eliminar(usuarioId)` | `EtiquetaPuerto/Eliminar/{id}` | — | `Observable<any>` |

---

## 3. Módulos y componentes Angular

```
src/app/modulos/
├── embarques/
│   ├── embarques.module.ts
│   ├── embarques-routing.module.ts
│   └── embarques.component.ts/.html/.css
│       Inputs:  —
│       Deps:    OperacionesPuertoService, SessionService
│       Usa:     <app-filtro-cargas>, <app-tabla-cargas>
│
├── reporte-pesada/
│   ├── reporte-pesada.module.ts
│   ├── reporte-pesada-routing.module.ts
│   └── reporte-pesada.component.ts/.html/.css
│       Inputs:  —
│       Deps:    ReportePesadaService
│       Usa:     <app-filtro-reporte-pesada>, tabla inline
│
├── configuracion-puerto/
│   ├── configuracion-puerto.module.ts
│   ├── configuracion-puerto-routing.module.ts
│   └── configuracion-puerto.component.ts/.html/.css
│       Inputs:  —
│       Deps:    BalanzaPuertoService, ConfirmationDialogService, FormBuilder
│       Usa:     <app-spinner>, formulario ReactiveForm inline
│
├── embarques-por-buques/
│   ├── embarques-por-buques.module.ts
│   ├── embarques-por-buques-routing.module.ts
│   └── embarques-por-buques.component.ts/.html/.css
│       Inputs:  —
│       Deps:    EmbarquesPorBuquesService
│       Usa:     <app-filtro-cargas>, <app-tabla-cargas>
│
└── etiquetas-puerto/
	├── etiquetas-puerto.module.ts
	├── etiquetas-puerto-routing.module.ts
	└── etiquetas-puerto.component.ts/.html/.css
		Inputs:  —
		Deps:    EtiquetaPuertoService, SessionService, ConfirmationDialogService
		Usa:     <app-spinner>, tabla inline

src/app/shared/componentes/
├── filtro-cargas/
│   └── filtro-cargas.component.ts/.html/.css
│       @Input()  exportadores: any[]
│       @Input()  materiales: any[]
│       @Output() filtrar: EventEmitter<any>
│       @Output() limpiar: EventEmitter<void>
│
├── tabla-cargas/
│   └── tabla-cargas.component.ts/.html/.css
│       @Input()  items: any[]
│       @Input()  itemsTotales: number
│       @Input()  paginaActual: number
│       @Input()  cargando: boolean
│       @Output() cambiarPagina: EventEmitter<number>
│       @Output() seleccionarCarga: EventEmitter<any>
│
└── filtro-reporte-pesada/
	└── filtro-reporte-pesada.component.ts/.html/.css
		@Input()  exportadores: any[]
		@Input()  materiales: any[]
		@Output() filtrar: EventEmitter<any>
		@Output() limpiar: EventEmitter<void>
```

---

## 4. Flujo de seguridad

```
Login (MSAL Azure AD)
  │
  ▼
login.component.ts.obtenerGruposAD()
  │  Llama a AutenticadorService.ObtenerGruposAD(grupos, usuario)
  │
  ▼
AutenticadorController (API Backend)
  │  Lee grupos AD del usuario autenticado
  │  Consulta ADPuertoGruposRoles → ADPuertoRoles → ADPuertoRolesPermisos → ADPuertoPermisos
  │
  ▼
user.permisos = ['Embarques_Ver', 'ReportePesada_Ver', ...]  (guardado en SessionService)
  │
  ├─▶ layout.component.html
  │     *ngIf='tienePermiso("Embarques_Ver")'  → muestra/oculta ítems del sidebar
  │
  ├─▶ app-routing.module.ts
  │     canActivateChild: [RoleGuard]  → valida permiso antes de cargar módulo lazy
  │
  └─▶ AutorizacionAttribute (API)
		[Autorizacion(PermisosScato.Embarques_Ver)]  → valida en cada request HTTP
```

### Tablas de base de datos involucradas

| Tabla | Rol en el flujo | Registros nuevos |
|---|---|---|
| `ADPuertoPermisos` | Define los permisos funcionales por nombre | 5 nuevos (`Embarques_Ver`, etc.) |
| `ADPuertoRoles` | Define grupos de roles (ya existían) | Ninguno nuevo |
| `ADPuertoRolesPermisos` | Mapea qué roles tienen qué permisos | ~20 nuevas filas |
| `ADPuertoGruposAd` | Mapea grupos AD a roles (ya existían) | Ninguno nuevo |
| `ADPuertoGruposRoles` | Mapea grupos AD a roles (ya existían) | Ninguno nuevo |

Los registros nuevos están en `Molinos.Scato.Database/Scripts/Post-Deployment/Datos Base.sql`, sección `-- Permisos Puerto - Logística (Migración PSP-727)`.

---

## 5. Infraestructura pre-existente reutilizada

| Componente | Uso |
|---|---|
| `AutorizacionAttribute` | Decorador en los 5 nuevos API controllers |
| `BaseController` | Clase base que provee `IServicioRepositorio` |
| `WebPuertoNinjectModule` | Registra `IServicioRepositorio` e `IServicioComandos` (ya incluidos) |
| `RoleGuard` / `MaslGuard` | Guards aplicados a las nuevas rutas lazy-load |
| `LayoutComponent` | Sidebar extendido con nueva sección |
| `SharedComponentModule` | Exporta los nuevos componentes compartidos |
| `ConfirmationDialogService` | Usado en BalanzaPuerto y EtiquetaPuerto para confirmaciones de eliminación |
| `SpinnerComponent` | Indicador de carga en todas las pantallas nuevas |
| `SessionService` | Obtención de usuario actual (id) en Etiquetas Puerto |

---

## 6. Notas de implementación

- **`IServicioOrquestador` no registrado en WebPuertoApi:** El `WebPuertoNinjectModule` no registra esta dependencia WCF. El endpoint de datos del orquestador (dispositivos) fue excluido del API; si se necesita en el futuro, hay que agregar `this.BindChannelFactory<IServicioOrquestador>("ServicioOrquestador")` en `WebPuertoNinjectModule` y el endpoint correspondiente en `Web.config`.

- **Paginación:** Todos los endpoints usan `new Paginacion(ordenarPor, dirOrden, pagina)` — constructor con parámetros nombrados, ya que `Paginacion` tiene setters privados (inmutable por diseño).

- **Idempotencia SQL:** Todos los `INSERT` en `Datos Base.sql` usan el patrón `IF NOT EXISTS(SELECT 1 FROM ...)` para ser seguros en re-ejecuciones del post-deployment.

- **Nada eliminado en Logística:** La solución `Molinos.Scato.Web` (Logística) no fue tocada. Los controllers y views de referencia permanecen intactos.
