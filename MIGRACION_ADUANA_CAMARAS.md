# Migración Módulo Aduana – Cámaras (Logística ➜ ScatoPuerto)

## 1) Objetivo de la migración
Migrar la pantalla de **Cámaras** del módulo Aduana al stack actual de ScatoPuerto:
- Frontend Angular: `Molinos.Scato.WebPuerto`
- API REST: `Molinos.Scato.WebPuertoApi`
- Reutilizando servicios de dominio existentes (`IServicioRepositorio` / `ServicioRepositorio`).

---

## 2) Origen legacy (referencia funcional)
Se tomó como referencia funcional la implementación legacy en MVC/JS:
- `Molinos.Scato.Web/Controllers/CamaraController.cs`
- `Molinos.Scato.WebOperaciones/Controllers/CamaraController.cs`
- `Molinos.Scato.WebOperaciones/Views/Camara/Index.cshtml`
- `Molinos.Scato.WebOperaciones/Scripts/camara.js`

La migración se implementó en ScatoPuerto (Angular + API), sin usar vistas `cshtml` para este módulo.

---

## 3) Modelo de datos reutilizado
Se reutilizó la entidad y DTO existentes para Aduana:
- Entidad: `Molinos.Scato.Dominio/Entidades/CamaraAduana.cs`
- DTO: `Molinos.Scato.Dominio/Dto/CamaraAduanaDto.cs`
- Mapping AutoMapper: `Molinos.Scato.Servicios/Conversiones/Impl/Perfiles/CamaraAduanaMappingProfile.cs`

Estructura de datos:
- `Id`
- `Nombre`
- `Url`
- `Posicion`

---

## 4) Backend/API migrado
### Controller API
Archivo: `Molinos.Scato.WebPuertoApi/Controllers/CamarasController.cs`

Endpoint implementado:
- `GET /api/Camaras/Listar`

Comportamiento:
1. Invoca `servicio.ListarCamarasAduana()`.
2. Devuelve `200 OK` con listado de cámaras para Aduana.

### Servicio de dominio reutilizado
En `ServicioRepositorio`:
- `ListarCamarasAduana()`

Lógica:
- Consulta `CamaraAduana`.
- Ordena por `Posicion` ascendente.

---

## 5) Frontend Angular migrado
### Módulo/ruteo
- Módulo: `Molinos.Scato.WebPuerto/src/app/modulos/aduana/aduana.module.ts`
- Ruta: `aduana-routing.module.ts`
  - `path: 'camaras'` ➜ `CamarasComponent`

### Servicio Angular
Archivo: `Molinos.Scato.WebPuerto/src/app/modulos/aduana/servicios/camaras.service.ts`

Implementación:
- `listar(): Observable<CamaraAduanaDto[]>`
- Consume `GET {apiUrl}/Camaras/Listar`.

### Componente Angular
Archivos:
- `camaras.component.ts`
- `camaras.component.html`
- `camaras.component.css`

Funcionalidad implementada:
1. Carga de cámaras al iniciar (`ngOnInit`).
2. Ordenamiento visual por `posicion`.
3. Estado de carga (`cargando`) y manejo de error (`error`).
4. Visualización en grilla de tarjetas con preview de imagen.
5. Modo ampliado por doble click (`onDobleClickCamara`).
6. Cierre de ampliado por:
   - doble click en overlay
   - tecla `Esc` (`HostListener`).

---

## 6) Resultado final
La migración de Cámaras para Aduana quedó operativa en ScatoPuerto con:
- API REST dedicada (`/api/Camaras/Listar`).
- Servicio Angular desacoplado.
- Componente visual moderno con grilla + fullscreen.
- Reutilización de modelo y lógica de dominio existente.
