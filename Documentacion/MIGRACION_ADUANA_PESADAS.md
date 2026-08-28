# Migración Módulo Aduana – Pesadas (Logística ➜ ScatoPuerto)

## 1) Objetivo de la migración
Migrar la funcionalidad de **Pesadas** desde el flujo legacy de Logística (WebMobile) al stack actual de **ScatoPuerto**:
- Frontend Angular: `Molinos.Scato.WebPuerto`
- API REST: `Molinos.Scato.WebPuertoApi`
- Reutilizando lógica de negocio existente en servicios/repositorio de dominio.

---

## 2) Origen legacy (Logística) migrado
### Controllers legacy identificados
- `Molinos.Scato.WebOperaciones/Controllers/PesadasOnlineController.cs`
- `Molinos.Scato.WebOperaciones/Controllers/PesadasHistoricaController.cs`
- (Referencia funcional relacionada) `Molinos.Scato.Web/Controllers/ReportePesadaSeisHorasController.cs`

### Views legacy identificadas
**Pesadas Online**
- `Molinos.Scato.WebOperaciones/Views/PesadasOnline/Index.cshtml`
- `Molinos.Scato.WebOperaciones/Views/PesadasOnline/Listar.cshtml`
- `Molinos.Scato.WebOperaciones/Views/PesadasOnline/DetalleCarga.cshtml`
- `Molinos.Scato.WebOperaciones/Views/PesadasOnline/DetalleCargaListar.cshtml`

**Pesadas Histórica**
- `Molinos.Scato.WebOperaciones/Views/PesadasHistorica/Index.cshtml`
- `Molinos.Scato.WebOperaciones/Views/PesadasHistorica/Listar.cshtml`
- `Molinos.Scato.WebOperaciones/Views/PesadasHistorica/DetalleCarga.cshtml`

**Reporte relacionado (Web)**
- `Molinos.Scato.Web/Views/ReportePesadaSeisHoras/Index.cshtml`
- `Molinos.Scato.Web/Views/ReportePesadaSeisHoras/Listar.cshtml`

---

## 3) Qué se migró (servicios/funcionalidad)
Se migraron estos casos de uso principales:

1. **Pesadas Online**
   - Listado del día con filtros por rango horario.
2. **Pesadas Históricas**
   - Listado por rango de fechas y horas.
3. **Detalle de Carga**
   - Listado de balanzadas asociadas a una carga.
4. **Totales por balanza (panel superior)**
   - Resumen para visualización en pantalla.

Estos flujos no reescriben la lógica de negocio: se apoyan en contratos ya existentes del backend.

---

## 4) Servicios de dominio reutilizados (existentes)
En `IServicioRepositorio` / `ServicioRepositorio` se reutilizaron:

- `ListarCargasOnline(DateTime desde, DateTime hasta, Paginacion paginacion)`
- `ListarCargasHistoricas(DateTime desde, DateTime hasta, Paginacion paginacion)`
- `ListarPaginadoBalanzadas(int id, int? idFin, string numeroBalanza, bool? enviado, Paginacion paginacion)`

### Funcionamiento general
- **Online/Históricas**: consultan cargas por fecha/hora y retornan DTO de reporte (`ReportePesadaDto`) paginado.
- **Detalle**: consulta balanzadas por `idCarga + numeroBalanza`, también paginado.
- El tipo de retorno de dominio es `ListaPaginada<T>`.

---

## 5) Nuevos servicios/API en ScatoPuerto (capa WebPuertoApi)
Se creó/ajustó `PesadasController` con endpoints REST:

- `GET /api/Pesadas/ListarOnline`
- `GET /api/Pesadas/ListarHistoricas`
- `GET /api/Pesadas/ObtenerDetalleCarga`
- `GET /api/Pesadas/ObtenerTotalesPorBalanza`

### Comportamiento de los endpoints
Cada endpoint:
1. Construye objeto `Paginacion`.
2. Invoca método reutilizado de `IServicioRepositorio`.
3. Devuelve respuesta JSON con estructura paginada explícita:

```json
{
  "items": [ ... ],
  "pagina": 1,
  "itemsPorPagina": 50,
  "itemsTotales": 123
}
```

> Nota: se devolvió estructura paginada explícita para evitar serialización como arreglo plano cuando el retorno de dominio implementa `IEnumerable`.

---

## 6) Nuevos servicios en Frontend (Angular)
En `Molinos.Scato.WebPuerto/src/app/modulos/aduana/servicios/pesadas.service.ts`:

- `obtenerPesadasOnline(...)`
- `obtenerPesadasHistoricas(...)`
- `obtenerDetalleCarga(...)`
- `obtenerTotalesPorBalanza(...)`

### Funcionamiento
- Construyen `HttpParams` para filtros/paginación.
- Llaman a los endpoints REST de `PesadasController`.
- Normalizan respuesta paginada para consumo consistente en componentes.

---

## 7) Pantallas/componentes migrados
Módulo Angular `aduana`:

- `pesadas-online`
- `pesadas-historicas`
- `detalle-carga`
- componente compartido de grilla/filtros (`components/pesadas`)
- panel superior (`components/aduana`)

### Capacidades implementadas
- Filtros por fecha/hora.
- Paginación.
- Ordenamiento por columnas.
- Navegación a detalle por carga/balanza.
- Ajustes visuales de menú e iconografía según lineamientos de ScatoPuerto.

---

## 8) Decisiones de alineación con ScatoPuerto
- Reutilización de servicios de dominio existentes (no duplicar lógica de negocio).
- Uso de patrón de API controllers de `WebPuertoApi` con `Paginacion`.

---

## 9) Resultado final
La migración dejó operativo el flujo de Pesadas en ScatoPuerto con:
- Backend reutilizado y expuesto por API REST.
- Front Angular modularizado.
- Contrato paginado consistente entre backend y frontend.
- Funcionalidad equivalente y modernizada respecto de Logística.
