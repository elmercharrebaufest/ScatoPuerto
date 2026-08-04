# Manual de Integración SAP — Cola Asincrónica (`ColaComandosAsincronico`)

---

## Índice

1. [Visión general de la arquitectura](#1-visión-general-de-la-arquitectura)
2. [Cola de comandos: `ColaComandosAsincronico`](#2-cola-de-comandos-colacomandosasincronico)
3. [Workers: cómo se procesan los ítems de la cola](#3-workers-cómo-se-procesan-los-ítems-de-la-cola)
4. [Configuración mediante la tabla `Parametros`](#4-configuración-mediante-la-tabla-parametros)
5. [Cómo crear un nuevo `ProcesadorEnviar...SAP`](#5-cómo-crear-un-nuevo-procesadorenvíarsap)
6. [Cómo crear un nuevo `Comando`](#6-cómo-crear-un-nuevo-comando)
7. [Inyección y uso de `ColaComandosAsincronico.Encolar`](#7-inyección-y-uso-de-colacomandosasincronicoencolar)
8. [Manejo de errores dentro de un Procesador](#8-manejo-de-errores-dentro-de-un-procesador)
9. [Integración con el Frontend](#9-integración-con-el-frontend)
10. [Flujo de datos: Backend → Frontend](#10-flujo-de-datos-backend--frontend)
11. [Diagrama de flujo completo](#11-diagrama-de-flujo-completo)
12. [Consideraciones operativas y buenas prácticas](#12-consideraciones-operativas-y-buenas-prácticas)

---

## 1. Visión general de la arquitectura

El sistema de integración SAP está basado en una **cola asincrónica particionada por entidad**. Cuando una acción del usuario (editar un buque, eliminar un buque, enviar un embarque) requiere comunicarse con SAP, en lugar de hacer la llamada de forma sincrónica bloqueando la respuesta HTTP, se **encola un `Comando`** y se responde inmediatamente al usuario.

En segundo plano, uno o más **workers** (hilos) consumen la cola, ejecutan el `Procesador` correspondiente, y registran el resultado en la tabla `TransaccionesSAP`. El frontend refleja el estado mediante **polling silencioso**.

```
Usuario → Controlador → Encolar(Comando) → ConcurrentQueue<Comando>
                                                    ↓
                                            Worker(s) en background
                                                    ↓
                                       ProcesadorEnviar...SAP.Ejecutar()
                                                    ↓
                                          ZSDWS_SCATO (SAP WCF)
                                                    ↓
                                          TransaccionesSAP (BD)
                                                    ↓
                                Frontend polling → muestra estado "SI" / "NO - error"
```

---

## 2. Cola de comandos: `ColaComandosAsincronico`

**Ubicación:** `Molinos.Scato.Servicios\Procesamiento\SAP\ColaComandosAsincronico.cs`

### 2.1 Particionamiento por entidad

La cola **no es única global**: está dividida en **particiones** identificadas por una clave de tipo `string`. Cada partición agrupa los comandos de una misma entidad, garantizando que los cambios sobre un mismo buque o embarque se procesen en **orden FIFO** y sin interferencias cruzadas.

| Tipo de comando      | Clave de partición      |
|----------------------|-------------------------|
| `EnviarBuqueSAP`     | `Vapor_{VaporId}`       |
| `EnviarBajaBuqueSAP` | `Vapor_{VaporId}`       |
| `EnviarEmbarqueSAP`  | `Embarque_{EmbarqueId}` |

> **Importante:** `EnviarBuqueSAP` y `EnviarBajaBuqueSAP` comparten la misma partición porque actúan sobre la misma entidad `VaporInformacion`. Esto evita que un alta y una baja del mismo buque se procesen en paralelo.

```csharp
private static string ObtenerClaveParticion(Comando comando)
{
    if (comando is EnviarBuqueSAP buq)
        return $"Vapor_{buq.VaporId}";

    if (comando is EnviarBajaBuqueSAP baja)
        return $"Vapor_{baja.VaporId}";

    if (comando is EnviarEmbarqueSAP emb)
        return $"Embarque_{emb.EmbarqueId}";

    return null; // Comando desconocido → se descarta
}
```

### 2.2 Protecciones al encolar

Antes de agregar un comando a la cola, `Encolar` aplica **dos filtros de protección**:

**a) Deduplicación en memoria (`YaEstaEnParticion`)**

Si ya existe un comando del mismo tipo y misma entidad en la cola en memoria, el nuevo se descarta. También previene que existan simultáneamente un `EnviarBuqueSAP` y un `EnviarBajaBuqueSAP` para el mismo vapor.

**b) Bloqueo por envío reciente o en curso (`ExisteEnvioRecienteOEnCurso`)**

Consulta la tabla `TransaccionesSAP` en base de datos. Si existe alguna transacción `Pendiente` **o** una transacción creada en los últimos 60 segundos (configurable con `SegundosBloqueoReenvio`) para la misma entidad, el comando se descarta.

```
Encolar(comando)
  ├── ObtenerClaveParticion → null?       → Descartar
  ├── YaEstaEnParticion?    → sí?         → Descartar
  ├── ExisteEnvioReciente?  → sí?         → Descartar
  └── cola.Enqueue(comando)
      └── IniciarWorkersNecesarios()
```

---

## 3. Workers: cómo se procesan los ítems de la cola

### 3.1 Inicio de workers

Cuando se encola un comando, `IniciarWorkersNecesarios()` itera las particiones con ítems pendientes y lanza un worker por cada partición disponible, **hasta el máximo configurado**.

`HostingEnvironment.QueueBackgroundWorkItem` corre el worker en un **ThreadPool thread** sin bloquear la respuesta HTTP, respetando el ciclo de vida del `AppDomain` de IIS (evita que el proceso sea reciclado mientras haya trabajo pendiente).

### 3.2 Ciclo de vida del worker

```
WorkerProcesarParticion(claveInicial)
  1. Lee ConfiguracionReintentoSAP y ConfiguracionTiempoReintentoSAP de BD
  2. WHILE TRUE:
     a. Vacía la cola de la partición actual (TryDequeue en loop)
        → Para cada comando: ProcesarComando(cmd, maxIntentos, segundosEspera)
     b. Limpia la partición si quedó vacía
     c. Libera la partición (_particionesEnProceso = 0)
     d. BuscarParticionDisponible()
        → ¿Hay otra partición disponible? → Tomar y continuar (worker stealing)
        → ¿No hay?                        → BREAK
  3. FINALLY: Interlocked.Decrement(_workersActivos)
              Si quedan particiones con ítems → IniciarWorkersNecesarios()
```

### 3.3 Procesamiento simultáneo (Worker Stealing)

Cuando un worker termina su partición, **no se detiene**: busca otra partición disponible y la toma. Esto maximiza la utilización de workers y evita situaciones donde hay particiones pendientes con todos los workers inactivos.

### 3.4 Reintentos por comando

```
Para intento = 1 hasta maxIntentos:
    ServicioComandos.Ejecutar(comando)
    → resultado.HayErrores == false: log éxito y break
    → resultado.HayErrores == true:  log error
        si intento < maxIntentos  → Thread.Sleep(segundosEspera)
        si intento == maxIntentos → log fallo definitivo
    FINALLY: cerrar canal WCF (Close o Abort según estado)
```

> El `Thread.Sleep` **bloquea ese thread** intencionalmente para no sobrecargar SAP con reintentos inmediatos.

---

## 4. Configuración mediante la tabla `Parametros`

La cola usa la tabla `Parametros` (campo `Descripcion` como clave, `Parametro2` como valor numérico).

### 4.1 Registros requeridos

| `Descripcion`                     | Descripción                                             | Default |
|-----------------------------------|---------------------------------------------------------|---------|
| `ConfiguracionMaxWorkersSAP`      | Número máximo de workers SAP corriendo en paralelo.     | `3`     |
| `ConfiguracionReintentoSAP`       | Cantidad de intentos antes de marcar fallo definitivo.  | `3`     |
| `ConfiguracionTiempoReintentoSAP` | Segundos a esperar entre reintentos fallidos.           | `60`    |

### 4.2 SQL de gestión

```sql
-- Ver valores actuales
SELECT Descripcion, Parametro2
FROM Parametros
WHERE Descripcion IN (
    'ConfiguracionMaxWorkersSAP',
    'ConfiguracionReintentoSAP',
    'ConfiguracionTiempoReintentoSAP'
);

-- Actualizar máximo de workers (ej: 5 workers)
UPDATE Parametros SET Parametro2 = 5  WHERE Descripcion = 'ConfiguracionMaxWorkersSAP';

-- Actualizar cantidad de reintentos (ej: 5 intentos)
UPDATE Parametros SET Parametro2 = 5  WHERE Descripcion = 'ConfiguracionReintentoSAP';

-- Actualizar tiempo entre reintentos (ej: 30 segundos)
UPDATE Parametros SET Parametro2 = 30 WHERE Descripcion = 'ConfiguracionTiempoReintentoSAP';

-- Insertar si no existen
INSERT INTO Parametros (Descripcion, Parametro2) VALUES ('ConfiguracionMaxWorkersSAP', 3);
INSERT INTO Parametros (Descripcion, Parametro2) VALUES ('ConfiguracionReintentoSAP', 3);
INSERT INTO Parametros (Descripcion, Parametro2) VALUES ('ConfiguracionTiempoReintentoSAP', 60);
```

### 4.3 Efecto de cada parámetro en tiempo de ejecución

- **`ConfiguracionMaxWorkersSAP`**: Se lee en cada llamada a `IniciarWorkersNecesarios`. Un cambio en BD es efectivo en el próximo encolamiento, **sin reiniciar IIS**.
- **`ConfiguracionReintentoSAP`** y **`ConfiguracionTiempoReintentoSAP`**: Se leen una vez al inicio de cada worker. Un cambio es efectivo cuando el worker actual termina y se inicia uno nuevo.

---

## 5. Cómo crear un nuevo `ProcesadorEnviar...SAP`

### 5.1 Dónde crearlo

```
Molinos.Scato.Servicios\Procesamiento\SAP\
  Buque\
    ProcesadorEnviarBuqueSAP.cs        ← existente
    ProcesadorEnviarBajaBuqueSAP.cs    ← existente
  Embarque\
    ProcesadorEnviarEmbarqueSAP.cs     ← existente
  NuevaEntidad\                         ← crear carpeta si aplica
    ProcesadorEnviarNuevaEntidadSAP.cs  ← nuevo
```

### 5.2 Estructura de la clase

```csharp
namespace Molinos.Scato.Servicios.Procesamiento.SAP.NuevaEntidad
{
    public class ProcesadorEnviarNuevaEntidadSAP : ProcesadorComando<EnviarNuevaEntidadSAP>
    {
        private readonly ZSDWS_SCATO _servicioSap;

        public ProcesadorEnviarNuevaEntidadSAP(
            IRepositorio repositorio, IConversor conversor,
            ILogger log, ZSDWS_SCATO servicioSap)
            : base(repositorio, conversor, log)
        {
            _servicioSap = servicioSap;
        }

        public override Resultado Ejecutar(EnviarNuevaEntidadSAP comando)
        {
            var resultado = new Resultado();

            // 1. Leer datos frescos de BD
            var entidad = Repositorio.Obtener<NuevaEntidad>(e => e.Id == comando.NuevaEntidadId);
            if (entidad == null)
            {
                resultado.Error("sapError", $"No se encontró la entidad ID {comando.NuevaEntidadId}");
                return resultado;
            }

            // 2. Determinar operación y construir request
            string operacion = entidad.EstaEnSap ? "M" : "A";
            var requestSap   = CrearRequestSap(entidad, operacion);

            // 3. Crear transacción pendiente en BD
            var transaccion = new TransaccionesSAP
            {
                Entidad       = "NuevaEntidad",
                Entidad_Id    = entidad.Id,
                Operacion     = operacion,
                PayloadXML    = XmlConverter<TipoRequestSAP>.Serialize(requestSap),
                Estado        = "Pendiente",
                Reintento     = ObtenerReintento(entidad.Id),
                FechaCreacion = DateTime.Now,
                Usuario       = comando.Usuario
            };
            Repositorio.Agregar(transaccion);
            Repositorio.GuardarCambios();

            // 4. Llamar a SAP
            string mensajeFrontend = "";
            try
            {
                var response    = _servicioSap.METODO_SAP(requestSap);
                var responseXml = XmlConverter<TipoResponseSAP>.Serialize(response);
                mensajeFrontend = response.RESPUESTA.EX_MESSAGE;

                transaccion.Estado      = response.RESPUESTA.EX_RESPONSE == "OK" ? "Enviado" : "Error";
                transaccion.ResponseSAP = responseXml;
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                Exception errorReal = ex;
                while (errorReal.InnerException != null) errorReal = errorReal.InnerException;

                transaccion.Estado      = "Error";
                transaccion.ResponseSAP = $"<Error><Exception>{errorReal.Message}</Exception></Error>";
                try { Repositorio.GuardarCambios(); } catch { }

                Log.Error(ex, "Error en ProcesadorEnviarNuevaEntidadSAP");
                resultado.Error("sapError", errorReal.Message);
                return resultado; // ColaComandosAsincronico detecta HayErrores y reintenta
            }

            if (transaccion.Estado == "Error")
                resultado.Error("sapError", $"Error de SAP: {mensajeFrontend}");

            return resultado;
        }

        #region Métodos privados

        private int ObtenerReintento(int entidadId)
        {
            var ultimo = Repositorio
                .Listar<TransaccionesSAP>(t => t.Entidad == "NuevaEntidad" && t.Entidad_Id == entidadId)
                .OrderByDescending(t => t.Id).FirstOrDefault();
            return (ultimo != null && ultimo.Estado == "Error") ? ultimo.Reintento + 1 : 0;
        }

        private TipoRequestSAP CrearRequestSap(NuevaEntidad entidad, string operacion)
        {
            // Construir y retornar el objeto request del proxy WCF
            throw new NotImplementedException();
        }

        #endregion
    }
}
```

> **El procesador nunca lanza excepciones.** Siempre retorna un `Resultado`. Si `resultado.HayErrores == true`, `ColaComandosAsincronico.ProcesarComando` lo detecta y activa el ciclo de reintentos.

### 5.3 Registrar en Ninject

En `Molinos.Scato.Dependencias\ServiciosWebNinjectModule.cs`, dentro del método `Load()`:

```csharp
Bind<ProcesadorComando<EnviarNuevaEntidadSAP>>().To<ProcesadorEnviarNuevaEntidadSAP>();
```

---

## 6. Cómo crear un nuevo `Comando`

### 6.1 Dónde crearlo

```
Molinos.Scato.Dominio\Comandos\SAP\
  EnviarBuqueSAP.cs          ← existente
  EnviarBajaBuqueSAP.cs      ← existente
  EnviarEmbarqueSAP.cs       ← existente
  EnviarNuevaEntidadSAP.cs   ← nuevo
```

### 6.2 Estructura del Comando

```csharp
namespace Molinos.Scato.Dominio.Comandos.SAP
{
    public class EnviarNuevaEntidadSAP : Comando
    {
        // Solo identificadores. El procesador lee los datos frescos desde BD.
        // La propiedad Usuario ya está heredada de la clase base Comando.
        public int NuevaEntidadId { get; set; }
    }
}
```

> **Regla importante:** El `Comando` solo debe contener **identificadores y metadatos**. La entidad completa se lee en el Procesador desde el repositorio, garantizando que siempre se envíen a SAP los datos más actualizados al momento del procesamiento.

### 6.3 Registrar la clave de partición en `ColaComandosAsincronico`

Agregar el nuevo caso en `ObtenerClaveParticion`:

```csharp
if (comando is EnviarNuevaEntidadSAP nueva)
    return $"NuevaEntidad_{nueva.NuevaEntidadId}";
```

### 6.4 Agregar deduplicación en `YaEstaEnParticion`

```csharp
if (comandoNuevo is EnviarNuevaEntidadSAP nn && cmdEnMemoria is EnviarNuevaEntidadSAP nm)
    if (nn.NuevaEntidadId == nm.NuevaEntidadId) return true;
```

---

## 7. Inyección y uso de `ColaComandosAsincronico.Encolar`

### 7.1 Interfaz

```csharp
// Molinos.Scato.Servicios\Procesamiento\SAP\IColaComandosAsincronico.cs
public interface IColaComandosAsincronico
{
    void Encolar(Comando comando);
}
```

### 7.2 Registro en Ninject (ya configurado en el proyecto)

```csharp
// Singleton: los diccionarios estáticos deben ser compartidos entre todos los requests
Bind<IColaComandosAsincronico>().To<ColaComandosAsincronico>().InSingletonScope();

// Fábricas para crear instancias con scope propio dentro de cada worker
// (los workers corren fuera del scope de un request HTTP)
Bind<Func<IServicioComandos>>().ToMethod(ctx => () => ctx.Kernel.Get<IServicioComandos>());
Bind<Func<IRepositorio>>().ToMethod(ctx => () => ctx.Kernel.Get<IRepositorio>());
```

> **¿Por qué `Func<>` en lugar de inyección directa?**  
> Los workers se ejecutan fuera del scope de un request HTTP. Las fábricas `Func<IServicioComandos>` y `Func<IRepositorio>` permiten crear instancias nuevas por cada comando procesado, evitando problemas de contexto de Entity Framework en threads de background.

### 7.3 Inyección en un servicio

```csharp
public class ServicioNuevaEntidad : IServicioNuevaEntidad
{
    private readonly IRepositorio _repositorio;
    private readonly IColaComandosAsincronico _cola;

    public ServicioNuevaEntidad(IRepositorio repositorio, IColaComandosAsincronico cola)
    {
        _repositorio = repositorio;
        _cola = cola;
    }

    public Resultado Guardar(int entidadId, string usuario)
    {
        // 1. Persistir cambios en BD primero
        _repositorio.GuardarCambios();

        // 2. Encolar el envío a SAP (no bloquea — SAP se procesa en segundo plano)
        _cola.Encolar(new EnviarNuevaEntidadSAP { NuevaEntidadId = entidadId, Usuario = usuario });

        return new Resultado(); // retorna inmediatamente
    }
}
```

### 7.4 Inyección en un controlador (si se llama directamente)

```csharp
public class NuevaEntidadController : ApiController
{
    private readonly IColaComandosAsincronico _cola;

    public NuevaEntidadController(IColaComandosAsincronico cola) { _cola = cola; }

    [HttpPost]
    [Route("api/NuevaEntidad/EnviarSAP")]
    public HttpResponseMessage EnviarSAP(int entidadId, [FromBody] string usuario)
    {
        try
        {
            _cola.Encolar(new EnviarNuevaEntidadSAP { NuevaEntidadId = entidadId, Usuario = usuario });
            return Request.CreateResponse(HttpStatusCode.OK,
                new { message = "Enviado a cola. Se procesará en segundo plano." });
        }
        catch (Exception ex)
        {
            return Request.CreateResponse(HttpStatusCode.InternalServerError,
                new { message = ex.Message });
        }
    }
}
```

---

## 8. Manejo de errores dentro de un Procesador

### 8.1 Excepción de comunicación WCF

```csharp
catch (Exception ex)
{
    Exception errorReal = ex;
    while (errorReal.InnerException != null) errorReal = errorReal.InnerException;

    transaccion.Estado      = "Error";
    transaccion.ResponseSAP = $"<Error><Exception>{errorReal.Message}</Exception></Error>";
    try { Repositorio.GuardarCambios(); } catch { }

    Log.Error(ex, "Error en ProcesadorEnviar...SAP");
    resultado.Error("sapError", errorReal.Message);
    return resultado; // trigger de reintento en ColaComandosAsincronico
}
```

### 8.2 Respuesta de error de SAP (sin excepción)

```csharp
transaccion.Estado      = response.RESPUESTA.EX_RESPONSE == "OK" ? "Enviado" : "Error";
transaccion.ResponseSAP = responseXml;
Repositorio.GuardarCambios();

// Fuera del try/catch:
if (transaccion.Estado == "Error")
    resultado.Error("sapError", $"Error de SAP: {mensajeFrontend}");
```

### 8.3 Alerta por fallo definitivo (ver `ProcesadorEnviarBajaBuqueSAP`)

```csharp
private void ManejarAlertaDeFalloDefinitivo(TransaccionesSAP transaccion, ...)
{
    // Con maxIntentos=3: Reintento 0=1er intento, 1=2do, 2=3ro (definitivo)
    if (transaccion.Reintento == 2)
    {
        _servicioComandos.Ejecutar(new EnvioMail
        {
            Destinatarios  = new List<string> { "soporte@empresa.com" },
            Copia          = new List<string>(),
            Titulo         = "ERROR SAP definitivo — NuevaEntidad",
            Cuerpo         = "Descripción del error y datos de la entidad afectada.",
            AttachmentName = null
        });
    }
}
```

> Si `ConfiguracionReintentoSAP` se cambia a 5, la alerta debe enviarse en `Reintento == 4`.

### 8.4 Estados en `TransaccionesSAP`

| `Estado`    | Significado                                               |
|-------------|-----------------------------------------------------------|
| `Pendiente` | Creada, aún no procesada por el worker.                   |
| `Enviado`   | SAP respondió `EX_RESPONSE == "OK"`.                     |
| `Error`     | SAP respondió con error o falló la comunicación WCF.     |

---

## 9. Integración con el Frontend

### 9.1 Principio general: no bloquear la UI

1. **Enviar la acción** → respuesta HTTP inmediata.
2. **Iniciar polling silencioso** cada ~4 segundos.
3. **Mostrar el estado inline** sin bloquear la interacción.

### 9.2 Componente `listado-vapor` (Buques)

**Archivo:** `Molinos.Scato.WebPuerto\src\app\modulos\vapor\listado-vapor\listado-vapor.component.ts`  
**Modelo frontend:** `Buque` (en `vapor.ts`) ↔ **DTO backend:** `VaporInformacionDto`

**Flujo al eliminar un buque:**

```
eliminarVapor(vapor)
  → POST /api/vapor/DeshabilitarBuque
  → vaporesEnProceso.add(vapor.vaporId)
  → iniciarPolling() → interval(4000ms) → refreshSilencioso()
      → GET /api/vapor/ListarVaporInformacion
      → detectarVaporesEnProceso()
          → vapor.enProceso == false → vaporesEnProceso.delete(id)
          → set vacío               → pollingSubscription.unsubscribe()
```

**Guard del spinner (no bloquear durante polling):**

```html
<ship-spinner *ngIf="estaCargando && !isPollingRefresh"></ship-spinner>
```

**Columna "EN SAP":**

```html
<!-- Procesando en background -->
<div *ngIf="vapor.enProceso || vaporesEnProceso.has(vapor.vaporId)">Procesando...</div>

<!-- Enviado exitosamente -->
<div *ngIf="vapor.enSap && !(vapor.enProceso || vaporesEnProceso.has(vapor.vaporId))"
     style="color: RGB(13,205,0); font-weight: bold;">SI</div>

<!-- No enviado, con o sin error -->
<div *ngIf="!vapor.enSap && !(vapor.enProceso || vaporesEnProceso.has(vapor.vaporId))">
    <span *ngIf="!vapor.mensajeSap">NO</span>
    <span *ngIf="vapor.mensajeSap">NO - {{ vapor.mensajeSap }}</span>
</div>
```

### 9.3 Componente `historial-buques` (Embarques)

**Archivo:** `Molinos.Scato.WebPuerto\src\app\modulos\buques\historial-buques\historial-buques.component.ts`

**Flujo al hacer clic en "Envío a SAP":**

```
onEnviarASAP(historial)
  → embarquesEnviandoSAP.add(historial.embarqueId)
  → POST /api/ProgramaEmbarque/EnviarEmbarqueSAP
      → ValidarEnviarEmbarqueSAP()
          → colaComandos.Encolar(new EnviarEmbarqueSAP { EmbarqueId, Usuario })
          → HTTP 200 inmediato
  → iniciarPolling() → interval(4000ms) → store dispatch → detectarVaporesEnProceso()
      → historial.enProceso == false → embarquesEnviandoSAP.delete(id)
      → set vacío                   → pollingSubscription.unsubscribe()
```

**Parseo de errores SAP (el `ResponseSAP` puede ser XML):**

```typescript
let errorBruto = item.mensajeErrorSap || item.MensajeErrorSap;
if (errorBruto) {
    if (errorBruto.includes("<EX_MESSAGE>")) {
        const match = errorBruto.match(/<EX_MESSAGE>(.*?)<\/EX_MESSAGE>/);
        item.mensajeErrorSap = match?.[1] ?? "Error en SAP";
    } else if (errorBruto.includes("<Exception>")) {
        const match = errorBruto.match(/<Exception>(.*?)<\/Exception>/);
        item.mensajeErrorSap = match?.[1] ?? "Error de sistema";
    }
}
```

**Botón "Envío a SAP":**

```html
<button
    [disabled]="!esEnvioSAPHabilitado(historial)
                || !hayCambiosParaEnviar(historial)
                || historial.enProceso
                || embarquesEnviandoSAP.has(historial.embarqueId)"
    (click)="onEnviarASAP(historial)">
    {{ embarquesEnviandoSAP.has(historial.embarqueId) ? 'Procesando...' : 'Envío a SAP' }}
</button>
```

### 9.4 Servicios Angular involucrados

| Servicio          | Método                                   | Endpoint                                       |
|-------------------|------------------------------------------|------------------------------------------------|
| `VaporService`    | `ListarVaporInformacion(pagina, tamaño)` | `GET /api/vapor/ListarVaporInformacion`        |
| `VaporService`    | `eliminarVapor(vapor, usuario)`          | `POST /api/vapor/DeshabilitarBuque`            |
| `VaporService`    | `reenviarVaporASap(vaporId)`             | `POST /api/vapor/ReenviarVaporASap`            |
| `BuqueService`    | `obtenerVaporInformacion(vaporId)`       | `GET /api/vapor/ObtenerShipParticular`         |
| `EmbarqueService` | `enviarEmbarqueSAP(embarqueId, usuario)` | `POST /api/ProgramaEmbarque/EnviarEmbarqueSAP` |

---

## 10. Flujo de datos: Backend → Frontend

### 10.1 Serialización JSON (camelCase automático)

`Global.asax.cs` usa `CamelCasePropertyNamesContractResolver`, por lo que los campos del DTO C# llegan al frontend en camelCase **sin mapeo manual**:

| DTO Backend (`VaporInformacionDto`) | JSON enviado    | Modelo Frontend (`Buque`) |
|------------------------------------|-----------------|--------------------------|
| `EnSap`                            | `enSap`         | `enSap: boolean`         |
| `MensajeSap`                       | `mensajeSap`    | `mensajeSap: string`     |
| `EnProceso`                        | `enProceso`     | `enProceso: boolean`     |
| `VaporId`                          | `vaporId`       | `vaporId: number`        |
| `Id`                               | `id`            | `id: number`             |

### 10.2 Cómo se calcula `EnProceso` en el backend

En `ListarVaporInformacionConsulta.cs` (lista) y `ServicioRepositorio.ObtenerVaporInformacion` (individual):

```
EnProceso = true si:
  - Existe TransaccionesSAP con Estado == "Pendiente" para esa entidad, O
  - Existe TransaccionesSAP con Estado == "Error" y quedan reintentos
    dentro de la ventana de tiempo de reintentos

MensajeSap = ResponseSAP de la última transacción con Estado == "Error"
             (solo se muestra si EnProceso == false, para no pisar el estado transitorio)
```

### 10.3 Modelos frontend y su uso

| Modelo frontend     | Archivo                                              | Usado por                        |
|--------------------|------------------------------------------------------|----------------------------------|
| `Buque`            | `src/app/shared/modelos/vapor/vapor.ts`              | `ListadoVaporComponent` (tabla)  |
| `VaporInformacion` | `src/app/shared/modelos/Buques/VaporInformacion.ts`  | Modal crear/editar buque         |

Ambos consumen el mismo JSON de `VaporInformacionDto`, pero `VaporInformacion` incluye campos adicionales del formulario de edición (`shipParticular`, etc.).

---

## 11. Diagrama de flujo completo

```
[Usuario hace acción en el frontend]
        │
        ▼
[Controlador Web API]
  GuardarCambiosEnBD()
  _cola.Encolar(new EnviarXxxSAP { Id = ..., Usuario = ... })
  return HTTP 200 inmediatamente
        │
        ▼
[ColaComandosAsincronico.Encolar()]
  ┌─ ObtenerClaveParticion → null? → Log.Warn + return (descartado)
  ├─ YaEstaEnParticion?    → true? → Log.Info + return (descartado)
  ├─ ExisteEnvioReciente?  → true? → Log.Info + return (descartado)
  └─ _particiones[clave].Enqueue(cmd) → IniciarWorkersNecesarios()
        │
        ▼
[HostingEnvironment.QueueBackgroundWorkItem]
  WorkerProcesarParticion("Entidad_Id")
    ├── Lee ConfiguracionReintentoSAP y ConfiguracionTiempoReintentoSAP de BD
    └── LOOP:
        TryDequeue(cmd)
          └─▶ ProcesarComando(cmd, maxIntentos, segundosEspera)
                FOR intento = 1..maxIntentos:
                  _fabricaServicioComandos().Ejecutar(cmd)
                    └─▶ ProcesadorXxx.Ejecutar(cmd)
                          ├── BD: TransaccionesSAP "Pendiente"
                          ├── ZSDWS_SCATO.METODO_SAP(request)
                          └── BD: TransaccionesSAP "Enviado"/"Error"
                  resultado.HayErrores y quedan intentos
                    → Thread.Sleep(segundosEspera)
                  Fallo definitivo → log error
                FINALLY: Close/Abort canal WCF
        LimpiarParticionVacia(clave)
        _particionesEnProceso[clave] = 0
        BuscarParticionDisponible()
          → hay otra → worker stealing → continuar con nueva partición
          → no hay   → break

  FINALLY: Interlocked.Decrement(_workersActivos)
           ¿Quedan particiones con ítems? → IniciarWorkersNecesarios()

[Frontend polling silencioso — interval(4000ms)]
  GET /api/entidad/Listar
  → enProceso == true                   → mostrar "Procesando..."
  → enProceso == false, enSap == true   → mostrar "SI" en verde
  → enProceso == false, enSap == false
      → mensajeSap presente             → mostrar "NO - {error}"
      → sin mensajeSap                  → mostrar "NO"
  → todos procesados → pollingSubscription.unsubscribe()
```

---

## 12. Consideraciones operativas y buenas prácticas

### 12.1 Consultas de auditoría en producción

```sql
-- Transacciones en error en las últimas 24h
SELECT Entidad, Entidad_Id, Operacion, Estado, Reintento, FechaCreacion, ResponseSAP
FROM TransaccionesSAP
WHERE Estado = 'Error'
  AND FechaCreacion >= DATEADD(HOUR, -24, GETDATE())
ORDER BY FechaCreacion DESC;

-- Transacciones pendientes (posible cola atascada)
SELECT *
FROM TransaccionesSAP
WHERE Estado = 'Pendiente'
ORDER BY FechaCreacion ASC;
```

### 12.2 Particiones estáticas y web farm

Los diccionarios `_particiones` y `_particionesEnProceso` son `static`: compartidos dentro del mismo proceso IIS. En una configuración de **web farm** (múltiples servidores), cada servidor tiene su propia cola en memoria sin sincronización entre nodos.

### 12.3 Reciclado de IIS

`HostingEnvironment.QueueBackgroundWorkItem` evita el reciclado automático mientras haya workers activos. Ante un reciclado **forzado**, los comandos en memoria se perderán y las transacciones `Pendiente` en BD quedarán sin procesar.

> **Recomendación:** Implementar un proceso de recuperación al inicio de la aplicación que busque transacciones `Pendiente` antiguas y las reencocle automáticamente.

### 12.4 `SegundosBloqueoReenvio` actualmente hardcodeado

La constante `SegundosBloqueoReenvio = 60` está fija en el código fuente. Para hacerla configurable vía BD:

```sql
INSERT INTO Parametros (Descripcion, Parametro2) VALUES ('ConfiguracionBloqueoReenvioSAP', 60);
```

```csharp
var param = repositorio.Obtener<Parametros>(p => p.Descripcion == "ConfiguracionBloqueoReenvioSAP");
var limite = DateTime.Now.AddSeconds(-(param?.Parametro2 ?? SegundosBloqueoReenvio));
```

### 12.5 Checklist para agregar soporte SAP a una nueva entidad

- [ ] Crear `EnviarNuevaEntidadSAP.cs` en `Molinos.Scato.Dominio\Comandos\SAP\`
- [ ] Crear `ProcesadorEnviarNuevaEntidadSAP.cs` en `Molinos.Scato.Servicios\Procesamiento\SAP\NuevaEntidad\`
- [ ] Registrar el procesador en `ServiciosWebNinjectModule.cs`
- [ ] Agregar la clave de partición en `ObtenerClaveParticion` de `ColaComandosAsincronico.cs`
- [ ] Agregar reglas de deduplicación en `YaEstaEnParticion` si aplica
- [ ] Inyectar `IColaComandosAsincronico` en el servicio o controlador que dispara el comando
- [ ] Agregar campos `EnProceso`, `EnSap`, `MensajeSap` al DTO del backend si el frontend debe mostrar estado
- [ ] Agregar los campos al modelo frontend correspondiente
- [ ] Implementar polling silencioso en el componente Angular que muestra la entidad
- [ ] Verificar/insertar los registros en la tabla `Parametros`
- [ ] Ejecutar las consultas SQL de auditoría después del primer envío en QA para validar el flujo