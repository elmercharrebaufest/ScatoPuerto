# Arquitectura e Implementación — Puerto Logística

**Rama base:** `feature/migracion-balanzadas/PSP-727-con-plan-tickets-731-a-735`  
**Rama activa (Migración Embarques PSP-731):** `feature/migracion-balanzadas/PSP-731-pantalla-embarques`

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
| POST | `api/OperacionesPuerto/EnviarASapLote` | `Embarques_Ver` | `[FromBody] List<EnviarLecturaBalanzadaTransmisionASap>` | `200 OK` / `500 Error` |
| POST | `api/OperacionesPuerto/CrearCarga` | `Embarques_Ver` | `[FromBody] CargaDto` | `200 OK` / `500 Error` |
| PUT | `api/OperacionesPuerto/ModificarCarga` | `Embarques_Ver` | `[FromBody] CargaDto` | `200 OK` / `500 Error` |
| POST | `api/OperacionesPuerto/CrearBalanzada` | `Embarques_Ver` | `[FromBody] BalanzadaDto` | `200 OK` / `500 Error` |
| PUT | `api/OperacionesPuerto/ModificarBalanzada` | `Embarques_Ver` | `[FromBody] BalanzadaDto` | `200 OK` / `500 Error` |
| DELETE | `api/OperacionesPuerto/EliminarBalanzada` | `Embarques_Ver` | `int id`, `int numero`, `string numeroBalanza` | `200 OK` / `500 Error` |
| GET | `api/OperacionesPuerto/ObtenerBalanzada` | `Embarques_Ver` | `int id`, `int numero`, `string numeroBalanza` | `BalanzadaDto` |
| POST | `api/OperacionesPuerto/CrearEmbarqueLiquido` | `Embarques_Ver` | `[FromBody] EmbarqueLiquidosDto` | `200 OK` (opcional `Advertencia`) / `500 Error` |
| GET | `api/OperacionesPuerto/TodoEnviado` | `Embarques_Ver` | `int id`, `int idFin`, `string numeroBalanza` | `bool` |
| GET | `api/OperacionesPuerto/ListarExportadores` | `Embarques_Ver` | — | `IList<ExportadorDto>` |
| GET | `api/OperacionesPuerto/ListarMateriales` | `Embarques_Ver` | — | `IList<MaterialPuertoDto>` |
| GET | `api/OperacionesPuerto/ListarBalanzasPuerto` | `Embarques_Ver` | — | `IList<BalanzaPuertoDto>` |
| GET | `api/OperacionesPuerto/ListarBalanzasAdministrativas` | `Embarques_Ver` | — | `IList<BalanzaPuertoDto>` |
| GET | `api/OperacionesPuerto/BuscarVapor` | `Embarques_Ver` | `string texto` | `VaporDto` |
| GET | `api/OperacionesPuerto/BuscarVapores` | `Embarques_Ver` | `string texto` | `IList<VaporDto>` |
| GET | `api/OperacionesPuerto/BuscarBodega` | `Embarques_Ver` | `string texto` | `BodegaDto` |
| GET | `api/OperacionesPuerto/BuscarBodegas` | `Embarques_Ver` | `string texto` | `IList<BodegaDto>` |
| GET | `api/OperacionesPuerto/BuscarExportador` | `Embarques_Ver` | `string texto` | `ExportadorDto` |
| GET | `api/OperacionesPuerto/BuscarExportadores` | `Embarques_Ver` | `string texto` | `IList<ExportadorDto>` |
| GET | `api/OperacionesPuerto/BuscarDestino` | `Embarques_Ver` | `string texto` | `DestinoDto` |
| GET | `api/OperacionesPuerto/BuscarDestinos` | `Embarques_Ver` | `string texto` | `IList<DestinoDto>` |
| GET | `api/OperacionesPuerto/BuscarMaterialPuerto` | `Embarques_Ver` | `string texto` | `MaterialPuertoDto` |
| GET | `api/OperacionesPuerto/BuscarMaterialesPuerto` | `Embarques_Ver` | `string texto` | `IList<MaterialPuertoDto>` |

> **Nota (Migración PSP-731):** los endpoints agregados a `OperacionesPuertoController` son wrappers delgados que reutilizan los DTOs, comandos (`CrearCarga`, `ModificarCarga`, `CrearBalanzada`, `ModificarBalanzada`, `EliminarBalanzada`, `ActualizarCargaOpuesta`, `EnviarLecturaBalanzadaTransmisionASap`) y `IServicioRepositorio` ya existentes en el dominio de Logística. `CrearEmbarqueLiquido` reproduce el flujo original (`CrearCarga` inicio → `CrearBalanzada` → `CrearCarga` fin → `ActualizarCargaOpuesta` → `EnviarLecturaBalanzadaTransmisionASap`) mediante los helpers `TransformarEmbarqueDtoEnCargaInicioDto`, `TransformarEmbarqueDtoEnCargaFinDto` y `TransformarEmbarqueDtoEnBalanzada`.

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
| `OperacionesPuertoService` | `enviarASapLote(comandos)` | `OperacionesPuerto/EnviarASapLote` | body JSON (array) | `Observable<any>` |
| `OperacionesPuertoService` | `crearCarga(dto)` | `OperacionesPuerto/CrearCarga` | body JSON | `Observable<any>` |
| `OperacionesPuertoService` | `modificarCarga(dto)` | `OperacionesPuerto/ModificarCarga` | body JSON | `Observable<any>` |
| `OperacionesPuertoService` | `crearBalanzada(dto)` | `OperacionesPuerto/CrearBalanzada` | body JSON | `Observable<any>` |
| `OperacionesPuertoService` | `modificarBalanzada(dto)` | `OperacionesPuerto/ModificarBalanzada` | body JSON | `Observable<any>` |
| `OperacionesPuertoService` | `eliminarBalanzada(id, numero, numBalanza)` | `OperacionesPuerto/EliminarBalanzada` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `obtenerBalanzada(id, numero, numBalanza)` | `OperacionesPuerto/ObtenerBalanzada` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `crearEmbarqueLiquido(dto)` | `OperacionesPuerto/CrearEmbarqueLiquido` | body JSON | `Observable<any>` |
| `OperacionesPuertoService` | `todoEnviado(id, idFin, numBalanza)` | `OperacionesPuerto/TodoEnviado` | HttpParams | `Observable<boolean>` |
| `OperacionesPuertoService` | `listarExportadores()` | `OperacionesPuerto/ListarExportadores` | — | `Observable<any[]>` |
| `OperacionesPuertoService` | `listarMateriales()` | `OperacionesPuerto/ListarMateriales` | — | `Observable<any[]>` |
| `OperacionesPuertoService` | `listarBalanzasPuerto()` | `OperacionesPuerto/ListarBalanzasPuerto` | — | `Observable<any[]>` |
| `OperacionesPuertoService` | `listarBalanzasAdministrativas()` | `OperacionesPuerto/ListarBalanzasAdministrativas` | — | `Observable<any[]>` |
| `OperacionesPuertoService` | `buscarVapor(texto)` / `buscarVapores(texto)` | `OperacionesPuerto/BuscarVapor(es)` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `buscarBodega(texto)` / `buscarBodegas(texto)` | `OperacionesPuerto/BuscarBodega(s)` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `buscarExportador(texto)` / `buscarExportadores(texto)` | `OperacionesPuerto/BuscarExportador(es)` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `buscarDestino(texto)` / `buscarDestinos(texto)` | `OperacionesPuerto/BuscarDestino(s)` | HttpParams | `Observable<any>` |
| `OperacionesPuertoService` | `buscarMaterialPuerto(texto)` / `buscarMaterialesPuerto(texto)` | `OperacionesPuerto/BuscarMaterialPuerto(s)` | HttpParams | `Observable<any>` |
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
│   ├── embarques.module.ts                            (declara EmbarquesComponent, EmbarqueModificarComponent, ModalCrearCargaComponent, ModalCrearEmbarqueLiquidoComponent; importa NgbModule)
│   ├── embarques-routing.module.ts                    (path '' → EmbarquesComponent; 'modificar/:id/:numeroBalanza(/:idFin)' → EmbarqueModificarComponent)
│   ├── embarques.component.ts/.html/.css
│   │   Inputs:  —
│   │   Deps:    OperacionesPuertoService, SessionService, NgbModal, Router
│   │   Usa:     <app-filtro-cargas modo="embarques">, <app-tabla-cargas modo="embarques">,
│   │            ModalCrearCargaComponent (inicio/fin), ModalCrearEmbarqueLiquidoComponent
│   │   Permisos: Embarques_Ver
│   ├── embarque-modificar/
│   │   └── embarque-modificar.component.ts/.html/.css
│   │       Ruta:    embarques/modificar/:id/:numeroBalanza(/:idFin)
│   │       Deps:    OperacionesPuertoService, ActivatedRoute, Router
│   │       Acciones: obtenerCarga, listarBalanzadas paginado, enviarASap (fila),
│   │                 enviarASapLote (bulk), eliminarBalanzada, volver
│   ├── modal-crear-carga/
│   │   └── modal-crear-carga.component.ts/.html/.css
│   │       Inputs:  tipo: 'inicio' | 'fin'
│   │       Deps:    NgbActiveModal, FormBuilder, OperacionesPuertoService
│   │       Acción:  crearCarga(dto); si tipo='fin' incluye ToneladasAW, FechaInicio, CargaOpuesta_Id
│   └── modal-crear-embarque-liquido/
│       └── modal-crear-embarque-liquido.component.ts/.html/.css
│           Deps:    NgbActiveModal, FormBuilder, OperacionesPuertoService
│           Acción:  crearEmbarqueLiquido(dto); surface del campo opcional `Advertencia`
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
│       @Input()  modo: 'embarques' | 'embarques-por-buques' = 'embarques-por-buques'
│       @Output() filtrar: EventEmitter<any>
│       @Output() limpiar: EventEmitter<void>
│       Nota: en modo 'embarques' expone NumeroBalanza, Id, VaporDesc,
│             BodegaDesc, DestinoDesc, ExportadorDesc, MaterialDesc,
│             FechaDesde, FechaHasta (Logística parity).
│
├── tabla-cargas/
│   └── tabla-cargas.component.ts/.html/.css
│       @Input()  items: any[]
│       @Input()  itemsTotales: number
│       @Input()  paginaActual: number
│       @Input()  cargando: boolean
│       @Input()  modo: 'embarques' | 'embarques-por-buques' = 'embarques-por-buques'
│       @Output() cambiarPagina: EventEmitter<number>
│       @Output() seleccionarCarga: EventEmitter<any>
│       @Output() modificarCarga: EventEmitter<any>   (sólo modo 'embarques')
│       Helpers: estadoDescripcion(carga), estadoClase(carga)
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

- **Migración pantalla Embarques (PSP-731):** el flujo completo de Embarques de Logística fue reproducido en ScatoPuerto reutilizando DTOs y comandos del dominio. La API se extendió con endpoints delgados en `OperacionesPuertoController`; el frontend agregó `EmbarqueModificarComponent`, `ModalCrearCargaComponent` y `ModalCrearEmbarqueLiquidoComponent` bajo `src/app/modulos/puerto-logistica/embarques/`. Los componentes compartidos `filtro-cargas` y `tabla-cargas` recibieron un `@Input() modo` (default `'embarques-por-buques'`) para preservar la pantalla existente `EmbarquesPorBuques` sin cambios.
