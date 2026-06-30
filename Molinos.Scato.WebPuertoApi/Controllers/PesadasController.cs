using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    /// <summary>
    /// API Controller para gestionar Pesadas Online, Históricas y Detalles de Carga.
    /// Migración desde Logística (WebMobile) a ScatoPuerto.
    /// </summary>
    [BasicAuthFilter]
    public class PesadasController : BaseController
    {
        public PesadasController(IServicioRepositorio servicio) : base(servicio)
        {
        }

        /// <summary>
        /// Obtiene el listado de Pesadas Online (del día actual).
        /// Filtra por rango horario configurado por el usuario.
        /// </summary>
        /// <param name="fechaDesde">Fecha de inicio (por defecto: hoy)</param>
        /// <param name="horaDesde">Hora de inicio (por defecto: 00:00:00)</param>
        /// <param name="horaHasta">Hora de fin (por defecto: hora actual)</param>
        /// <param name="pagina">Número de página (default: 1)</param>
        /// <param name="itemsPorPagina">Items por página (default: 50)</param>
        /// <param name="ordenarPor">Campo para ordenar (default: Fecha)</param>
        /// <returns>ListaPaginada de ReportePesadaDto</returns>
        [HttpGet]
        [Route("api/Pesadas/ListarOnline")]
        public HttpResponseMessage ListarOnline(
            DateTime? fechaDesde = null,
            TimeSpan? horaDesde = null,
            TimeSpan? horaHasta = null,
            int pagina = 1,
            int itemsPorPagina = 50,
            string ordenarPor = "Fecha")
        {
            try
            {
                var fecha = fechaDesde ?? DateTime.Now.Date;
                var hInicio = horaDesde ?? TimeSpan.Parse("00:00:00");
                var hFin = horaHasta ?? new TimeSpan(DateTime.Now.Hour, DateTime.Now.Minute, 0);

                var selectedStartDateTime = fecha + hInicio;
                var selectedEndDateTime = fecha + hFin;

                var paginacion = new Paginacion(ordenarPor, DirOrden.Asc, pagina, itemsPorPagina);

                // Llamada al servicio (método específico para Online)
                var resultado = servicio.ListarCargasOnline(selectedStartDateTime, selectedEndDateTime, paginacion);

                if (resultado != null)
                {
                    System.Diagnostics.Debug.WriteLine($"Resultado Items count: {resultado.Items?.Count ?? 0}");
                }

                var respuesta = new
                {
                    Items = resultado.Items,
                    Pagina = resultado.Pagina,
                    ItemsPorPagina = resultado.ItemsPorPagina,
                    ItemsTotales = resultado.ItemsTotales
                };

                return Request.CreateResponse(HttpStatusCode.OK, respuesta);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new { error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        /// <summary>
        /// Obtiene el listado de Pesadas Históricas (rango de fechas).
        /// Filtra por rango de fechas y horas configurado por el usuario.
        /// </summary>
        /// <param name="fechaDesde">Fecha de inicio</param>
        /// <param name="fechaHasta">Fecha de fin</param>
        /// <param name="horaDesde">Hora de inicio (default: 00:00:00)</param>
        /// <param name="horaHasta">Hora de fin (default: 23:59:00)</param>
        /// <param name="pagina">Número de página (default: 1)</param>
        /// <param name="itemsPorPagina">Items por página (default: 50)</param>
        /// <param name="ordenarPor">Campo para ordenar (default: Fecha)</param>
        /// <returns>ListaPaginada de ReportePesadaDto</returns>
        [HttpGet]
        [Route("api/Pesadas/ListarHistoricas")]
        public HttpResponseMessage ListarHistoricas(
            DateTime? fechaDesde = null,
            DateTime? fechaHasta = null,
            TimeSpan? horaDesde = null,
            TimeSpan? horaHasta = null,
            int pagina = 1,
            int itemsPorPagina = 50,
            string ordenarPor = "Fecha")
        {
            try
            {
                // Valores por defecto (rango de 7 días si no se especifica)
                var hoy = DateTime.Now;
                var fDesde = fechaDesde ?? hoy.AddDays(-7);
                var fHasta = fechaHasta ?? hoy;
                var hInicio = horaDesde ?? TimeSpan.Parse("00:00:00");
                var hFin = horaHasta ?? TimeSpan.Parse("23:59:00");

                var selectedStartDateTime = fDesde.Date + hInicio;
                var selectedEndDateTime = fHasta.Date + hFin;

                var paginacion = new Paginacion(ordenarPor, DirOrden.Asc, pagina, itemsPorPagina);

                var resultado = servicio.ListarCargasHistoricas(selectedStartDateTime, selectedEndDateTime, paginacion);

                var respuesta = new
                {
                    Items = resultado.Items,
                    Pagina = resultado.Pagina,
                    ItemsPorPagina = resultado.ItemsPorPagina,
                    ItemsTotales = resultado.ItemsTotales
                };

                return Request.CreateResponse(HttpStatusCode.OK, respuesta);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new { error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        /// <summary>
        /// Obtiene el detalle de carga (listado de balanzadas) para una carga específica.
        /// Utilizado tanto en Pesadas Online como en Históricas.
        /// </summary>
        /// <param name="idCarga">ID de la carga</param>
        /// <param name="numeroBalanza">Número de balanza</param>
        /// <param name="pagina">Número de página (default: 1)</param>
        /// <param name="itemsPorPagina">Items por página (default: 50)</param>
        /// <returns>ListaPaginada de BalanzadaDto con campos (Fecha, PesoBruto, PesoTara, PesoNeto, Capacidad)</returns>
        [HttpGet]
        [Route("api/Pesadas/ObtenerDetalleCarga")]
        public HttpResponseMessage ObtenerDetalleCarga(
            int idCarga,
            string numeroBalanza,
            int pagina = 1,
            int itemsPorPagina = 50)
        {
            try
            {

                var paginacion = new Paginacion("Id", DirOrden.Asc, pagina, itemsPorPagina);

                // Llamada al servicio para obtener detalles de balanzadas
                var resultado = servicio.ListarPaginadoBalanzadas(idCarga, null, numeroBalanza, null, paginacion);

                var respuesta = new
                {
                    Items = resultado.Items,
                    Pagina = resultado.Pagina,
                    ItemsPorPagina = resultado.ItemsPorPagina,
                    ItemsTotales = resultado.ItemsTotales
                };

                return Request.CreateResponse(HttpStatusCode.OK, respuesta);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new { error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        /// <summary>
        /// Obtiene información resumida de totales embarcados por balanza (opcional).
        /// Útil para mostrar en el panel superior de la UI.
        /// </summary>
        /// <param name="fechaDesde">Fecha de inicio</param>
        /// <param name="horaDesde">Hora de inicio</param>
        /// <param name="horaHasta">Hora de fin</param>
        /// <returns>Información agregada de balanzas</returns>
        [HttpGet]
        [Route("api/Pesadas/ObtenerTotalesPorBalanza")]
        public HttpResponseMessage ObtenerTotalesPorBalanza(
            DateTime? fechaDesde = null,
            TimeSpan? horaDesde = null,
            TimeSpan? horaHasta = null)
        {
            try
            {
                var fecha = fechaDesde ?? DateTime.Now.Date;
                var hInicio = horaDesde ?? TimeSpan.Parse("00:00:00");
                var hFin = horaHasta ?? new TimeSpan(DateTime.Now.Hour, DateTime.Now.Minute, 0);

                var selectedStartDateTime = fecha + hInicio;
                var selectedEndDateTime = fecha + hFin;

                // Llamada al servicio para obtener totales
                var resultado = servicio.ListarCargasOnline(selectedStartDateTime, selectedEndDateTime, new Paginacion("Fecha", DirOrden.Asc, 1, 1000));

                var respuesta = new
                {
                    Items = resultado.Items,
                    Pagina = resultado.Pagina,
                    ItemsPorPagina = resultado.ItemsPorPagina,
                    ItemsTotales = resultado.ItemsTotales
                };

                return Request.CreateResponse(HttpStatusCode.OK, respuesta);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new { error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }
    }
}
