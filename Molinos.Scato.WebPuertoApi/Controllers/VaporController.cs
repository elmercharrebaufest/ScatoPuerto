using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class VaporController : BaseController
    {       
        public VaporController(IServicioRepositorio servicio, IServicioVapor servicioVapor) : base(servicio, null, servicioVapor)
        {
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
        public HttpResponseMessage GuardarVaporInformacion(VaporInformacionDto vaporInformacionDto)
        {
            try
            {
                vaporInformacionDto.Usuario = base.nombreUsuario;
                servicioVapor.GuardarVaporInformacion(vaporInformacionDto);
            return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
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

    }
}
