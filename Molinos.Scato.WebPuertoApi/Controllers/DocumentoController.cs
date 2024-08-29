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

    }
}