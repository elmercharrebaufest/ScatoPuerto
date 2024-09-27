using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class DocumentoController : BaseController
    {
        public DocumentoController(IServicioRepositorio servicio, IServicioDocumento servicioDocumento) : base(servicio, servicioDocumento: servicioDocumento) { }

        [HttpGet]
        [Route("api/documento/ListarDocumentoTipos")]
        public HttpResponseMessage ListarDocumentoTipos()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioDocumento.ListarDocumentoTipos());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [Route("api/documento/ListarNominacionDocumentoEstados")]
        public HttpResponseMessage ListarNominacionDocumentoEstados()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioDocumento.ListarNominacionDocumentoEstados());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ListarDocumentos")]
        public HttpResponseMessage ListarDestinos(int pagina = 1, int itemsPorPagina = 10, string nombre = null)
        {
            try
            {
                var listaPaginada = servicioDocumento.ListarDocumentos(nombre, pagina, itemsPorPagina);
                var response = new { listaPaginada.Items, listaPaginada.ItemsTotales };
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ObtenerDocumento")]
        public HttpResponseMessage ObtenerDocumento(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioDocumento.ObtenerDocumento(id));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/documento/CrearDocumento")]
        public HttpResponseMessage CrearDocumento(DocumentoDto documento)
        {
            try
            {
                servicioDocumento.CrearDocumento(documento, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/documento/ModificarDocumento")]
        public HttpResponseMessage ModificarDocumento(DocumentoDto documento)
        {
            try
            {
                servicioDocumento.ModificarDocumento(documento, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Route("api/documento/EliminarDocumento")]
        public HttpResponseMessage EliminarDocumento(int id)
        {
            try
            {
                servicioDocumento.EliminarDocumento(id, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

    }
}