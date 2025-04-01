using Molinos.Scato.Dominio.Comandos;
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
    [BasicAuthFilter]
    public class BalanzaManualController : BaseController
    {
        private readonly IServicioComandos comandos;

        public BalanzaManualController(IServicioRepositorio servicio, IServicioComandos comandos) : base(servicio)
        {
            this.comandos = comandos;
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/BalanzaManual/ListarBalanzaManual")]
        public HttpResponseMessage ListarBalanzaManual(int moduloDeCargaId)
        {
            return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarBalanzaManual(moduloDeCargaId));
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/BalanzaManual/ObtenerPeriodoDeCarga")]
        public HttpResponseMessage ObtenerPeriodoDeCarga(int moduloDeCargaId)
        {
            return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerPeriodoDeCarga(moduloDeCargaId));
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/BalanzaManual/GuardarCortesBajaCarga")]
        public HttpResponseMessage GuardarCortesBajaCarga(BalanzasCortesDto balanzasCortes)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.GuardarBalanzaManual(balanzasCortes, balanzasCortes.Usuario));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
        [HttpDelete]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/BalanzaManual/EliminarCortesBajaCarga")]
        public HttpResponseMessage EliminarCortesBajaCarga(int id, string usuario)  
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.EliminarBalanzaManual(id, usuario));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
    }
}
