using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using Newtonsoft.Json;
using System;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class VaporController : BaseController
    {
        private readonly IServicioComandos comandos;

        public VaporController(IServicioRepositorio servicio, IServicioComandos comandos, IServicioVapor servicioVapor) : base(servicio, null, servicioVapor)
        {
            this.comandos = comandos;
        }

        [HttpGet]
        [Route("api/Vapor/ListarVaporInformacion")]
        public HttpResponseMessage ListarVaporInformacion(int? pagina = null, int? itemsPorPagina = null, string buque = null, string imo = null, string tipoBuque = null, string bandera = null)
        {
            try
            {
                var paginacion = new Paginacion(null, DirOrden.Desc, (pagina == null) ? 0 : pagina.Value, (itemsPorPagina == 0 || !itemsPorPagina.HasValue) ? 10 : itemsPorPagina.Value);
                var response = servicioVapor.ListarVaporInformacion(paginacion, buque, imo,
                    (!string.IsNullOrEmpty(tipoBuque) ? tipoBuque.Split(',').ToList() : null),
                    bandera);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Vapor/GuardarVaporInformacion")]
        public HttpResponseMessage GuardarVaporInformacion()
        {
            try
            {
                // Obtener los campos del formData
                var vaporJson = HttpContext.Current.Request.Form["vapor"];
                VaporDto vapor = null;
                if (!string.IsNullOrEmpty(vaporJson))
                {
                    vapor = JsonConvert.DeserializeObject<VaporDto>(vaporJson);
                }

                var vaporIdString = HttpContext.Current.Request.Form["vaporId"];
                int vaporId = 0;
                if (!string.IsNullOrEmpty(vaporIdString) && int.TryParse(vaporIdString, out var parsedVaporId))
                {
                    vaporId = parsedVaporId;
                }

                var banderaJson = HttpContext.Current.Request.Form["bandera"];
                BanderaDto bandera = null;
                if (!string.IsNullOrEmpty(banderaJson))
                {
                    bandera = JsonConvert.DeserializeObject<BanderaDto>(banderaJson);
                }
                var nombreBuque = HttpContext.Current.Request.Form["nombreBuque"];
                var tipoBuque = HttpContext.Current.Request.Form["tipoBuque"];
                var categoriaBuque = HttpContext.Current.Request.Form["categoriaBuque"];
                var imoVapor = HttpContext.Current.Request.Form["imoVapor"];

                var freeboardString = HttpContext.Current.Request.Form["freeboard"];
                decimal freeboard = 0;
                if (!string.IsNullOrEmpty(freeboardString) && decimal.TryParse(freeboardString, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedFreeboard))
                {
                    freeboard = parsedFreeboard;
                }

                var esloraString = HttpContext.Current.Request.Form["eslora"];
                decimal eslora = 0;
                if (!string.IsNullOrEmpty(esloraString) && decimal.TryParse(esloraString, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedEslora))
                {
                    eslora = parsedEslora;
                }

                var porteNetoString = HttpContext.Current.Request.Form["porteNeto"];
                decimal porteNeto = 0;
                if (!string.IsNullOrEmpty(porteNetoString) && decimal.TryParse(porteNetoString, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedPorteNeto))
                {
                    porteNeto = parsedPorteNeto;
                }

                var porteBrutoString = HttpContext.Current.Request.Form["porteBruto"];
                decimal porteBruto = 0;
                if (!string.IsNullOrEmpty(porteBrutoString) && decimal.TryParse(porteBrutoString, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedPorteBruto))
                {
                    porteBruto = parsedPorteBruto;
                }

                var mangaString = HttpContext.Current.Request.Form["manga"];
                decimal manga = 0;
                if (!string.IsNullOrEmpty(mangaString) && decimal.TryParse(mangaString, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedManga))
                {
                    manga = parsedManga;
                }

                var puntualString = HttpContext.Current.Request.Form["puntual"];
                decimal puntual = 0;
                if (!string.IsNullOrEmpty(puntualString) && decimal.TryParse(puntualString, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedPuntual))
                {
                    puntual = parsedPuntual;
                }

                var cantidadBodegasTksString = HttpContext.Current.Request.Form["cantidadBodegasTks"];
                int cantidadBodegasTks = 0;
                if (!string.IsNullOrEmpty(cantidadBodegasTksString) && int.TryParse(cantidadBodegasTksString, out var parsedCantidadBodegasTksString))
                {
                    cantidadBodegasTks = parsedCantidadBodegasTksString;
                }
                // Crear el objeto VaporInformacionDto
                var vaporInformacionDto = new VaporInformacionDto
                {
                    VaporId = vaporId,
                    Vapor = vapor,
                    NombreBuque = nombreBuque,
                    TipoBuque = tipoBuque,
                    Bandera = bandera,
                    ImoVapor = imoVapor,
                    Freeboard = freeboard,
                    Eslora = eslora,
                    PorteNeto = porteNeto,
                    PorteBruto = porteBruto,
                    Manga = manga,
                    Puntual = puntual,
                    CantidadBodegasTks = cantidadBodegasTks,
                    Usuario = base.nombreUsuario // Usuario autenticado
                };

                var archivo = HttpContext.Current.Request.Files["archivo"];

                // Guardar la información del vapor
                //servicioVapor.GuardarVaporInformacion(vaporInformacionDto, archivoDto);
                var crearBuque = new CrearBuque() { VaporInformacion = vaporInformacionDto, Archivo = archivo != null ? new ArchivoDto(archivo) : null };
                comandos.Ejecutar(crearBuque);
                return Request.CreateResponse(HttpStatusCode.OK, "Información del buque guardada correctamente.");
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Vapor/DevolverHistoricoVapor")]
        public HttpResponseMessage DevolverHistoricoVapor(int id)
        {
            try
            {
                var response = servicioVapor.DevolverHistoricoVapor(id);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        [Route("api/Vapor/ValidarBuque")]
        public HttpResponseMessage ValidarBuque(string bandera, string nombre, string imo, int? id)
        {
            try
            {
                var response = servicioVapor.ValidarBuque(bandera, nombre, imo, id);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpPost]
        [Route("api/Vapor/DeshabilitarBuque")]
        public HttpResponseMessage DeshabilitarBuque(VaporDto vaporDto)
        {
            try
            {
                string usuario = base.nombreUsuario;
                servicioVapor.DeshabilitarVapor(vaporDto, usuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        [Route("api/Vapor/ObtenerShipParticular")]
        public HttpResponseMessage ObtenerShipParticular(int id)
        {
            try
            {
                var archivo = servicioVapor.ObtenerShipParticular(id);
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new ByteArrayContent(archivo.Contenido);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(archivo.TipoContenido);
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = archivo.Nombre };
                return response;
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
    }
}