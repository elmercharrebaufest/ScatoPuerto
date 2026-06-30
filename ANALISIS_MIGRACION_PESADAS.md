# ANÁLISIS MIGRACIÓN PESADAS - LOGÍSTICA → SCATOPUERTO

## Estructura Actual (Logística - WebMobile)

### Controladores (2 separados):
1. **PesadasOnlineController**
   - Acción: `Index()` - muestra la página inicial
   - Acción: `Listar()` [AJAX] - ejecuta búsqueda (POST implícito vía formulario)
   - Acción: `Seleccionar()` - abre detalle de carga
   - Acción: `DetalleCargaListar()` [AJAX] - obtiene los detalles paginados

2. **PesadasHistoricaController**
   - Acción: `Index()` - muestra la página inicial
   - Acción: `Listar()` [AJAX] - ejecuta búsqueda con rango de fechas
   - Acción: `Seleccionar()` - abre detalle de carga (igual a Online)

### Endpoints por Tipo (DOS ENDPOINTS DISTINTOS):
- **Online**: `servicio.ListarCargasOnline(desde, hasta, paginacion)`
  - Filtra por: Fecha desde/hasta (MISMO DÍA)
  - Hora: desde/hasta (configurable)
  - Filtros adicionales: solo tipo == "inicio"
  - Recalcula TotalEmbarcado si es 0
  
- **Histórico**: `servicio.ListarCargasHistoricas(desde, hasta, paginacion)`
  - Filtra por: Fecha desde/hasta (RANGO DE FECHAS)
  - Hora: desde/hasta (configurable)
  - Filtros adicionales: tipo == "inicio" AND Exportador != ""
  - Sin recálculo de TotalEmbarcado

### Detalle de Carga (COMÚN):
- `servicio.ListarPaginadoBalanzadas(idCarga, idFin, numeroBalanza, enviado, paginacion)`
  - Mismo endpoint para ambos casos
  - Retorna: BalanzadaDto[] (Fecha, PesoBruto, PesoTara, PesoNeto, Capacidad)

---

## ✅ MIGRACIÓN A SCATOPUERTO COMPLETADA

### Archivo Creado:
**`Molinos.Scato.WebPuertoApi/Controllers/PesadasController.cs`**

Este controlador API REST unifica toda la lógica con los siguientes endpoints:

#### 1. GET /api/Pesadas/ListarOnline
```
Query Parameters:
  - fechaDesde (DateTime?, default: today)
  - horaDesde (TimeSpan?, default: 00:00:00)
  - horaHasta (TimeSpan?, default: now)
  - pagina (int, default: 1)
  - itemsPorPagina (int, default: 50)
  - ordenarPor (string, default: "Fecha")

Returns: ListaPaginada<ReportePesadaDto>

Autorización: [Autorizacion(PermisosScato.ScatoPuerto)]
```

**Comportamiento:**
- Filtra cargas del día actual con rango horario flexible
- Llama a: `servicio.ListarCargasOnline()`
- Mismo comportamiento que WebMobile online

---

#### 2. GET /api/Pesadas/ListarHistoricas
```
Query Parameters:
  - fechaDesde (DateTime?, default: today - 7 days)
  - fechaHasta (DateTime?, default: today)
  - horaDesde (TimeSpan?, default: 00:00:00)
  - horaHasta (TimeSpan?, default: 23:59:00)
  - pagina (int, default: 1)
  - itemsPorPagina (int, default: 50)
  - ordenarPor (string, default: "Fecha")

Returns: ListaPaginada<ReportePesadaDto>

Autorización: [Autorizacion(PermisosScato.ScatoPuerto)]
```

**Comportamiento:**
- Filtra cargas en rango de fechas con rango horario flexible
- Llama a: `servicio.ListarCargasHistoricas()`
- Mismo comportamiento que WebMobile histórico
- Excluye exportadores vacíos (filtro en servicio)

---

#### 3. GET /api/Pesadas/ObtenerDetalleCarga
```
Query Parameters:
  - idCarga (int, required)
  - numeroBalanza (string, required)
  - pagina (int, default: 1)
  - itemsPorPagina (int, default: 50)

Returns: ListaPaginada<BalanzadaDto>

Autorización: [Autorizacion(PermisosScato.ScatoPuerto)]
```

**Comportamiento:**
- Obtiene detalles de una carga específica (balanzadas)
- Llama a: `servicio.ListarPaginadoBalanzadas()`
- Usado por Online Y Histórico (componente reutilizable)
- DTO retorna: Fecha, PesoBruto, PesoTara, PesoNeto, Capacidad

---

#### 4. GET /api/Pesadas/ObtenerTotalesPorBalanza (OPCIONAL)
```
Query Parameters:
  - fechaDesde (DateTime?, default: today)
  - horaDesde (TimeSpan?, default: 00:00:00)
  - horaHasta (TimeSpan?, default: now)

Returns: Objeto anónimo con totales agregados

Autorización: [Autorizacion(PermisosScato.ScatoPuerto)]
```

**Nota:** Endpoint placeholder para futura implementación de agregados de balanzas en tiempo real (panel superior).

---

## RESPUESTA FINAL: ¿UNO O DOS ENDPOINTS PARA PESADAS?

**RESPUESTA: DOS ENDPOINTS DISTINTOS (`ListarOnline` y `ListarHistoricas`)**

**Razones:**

| Aspecto | Online | Histórico |
|--------|--------|-----------|
| **Rango de fechas** | Mismo día (configurable hora) | Rango libre de fechas |
| **Método servicio** | `ListarCargasOnline()` | `ListarCargasHistoricas()` |
| **Filtros adicionales** | Solo tipo="inicio" | tipo="inicio" AND Exportador != "" |
| **TotalEmbarcado** | Se recalcula si es 0 | No se recalcula |
| **Endpoint API** | GET /api/Pesadas/ListarOnline | GET /api/Pesadas/ListarHistoricas |

**UNIFICACIÓN:**
- ✅ **Detalle de Carga**: UN SOLO endpoint `/api/Pesadas/ObtenerDetalleCarga` (reutilizable)
- ✅ **ComponentesAngular**: Online y Histórico usan el mismo componente `PesadasComponent` con filtros variables
- ✅ **Front-end**: Llama a uno u otro endpoint según contexto (Online vs Histórico)

---

## Integración con Angular (Front)

Los servicios HTTP Angular consumirán así:

```typescript
// Pesadas Online
this.http.get('/api/Pesadas/ListarOnline', {
  params: { fechaDesde, horaDesde, horaHasta, pagina, itemsPorPagina }
})

// Pesadas Históricas
this.http.get('/api/Pesadas/ListarHistoricas', {
  params: { fechaDesde, fechaHasta, horaDesde, horaHasta, pagina, itemsPorPagina }
})

// Detalle (compartido)
this.http.get('/api/Pesadas/ObtenerDetalleCarga', {
  params: { idCarga, numeroBalanza, pagina, itemsPorPagina }
})
```

---

## Próximos Pasos:

1. ✅ **Backend Controller creado** → PesadasController.cs
2. ⏳ **Service HTTP en Angular** (pesadas.service.ts)
3. ⏳ **Componentes Angular** usando endpoints API
4. ⏳ **Integración con el resto del módulo Aduana**

