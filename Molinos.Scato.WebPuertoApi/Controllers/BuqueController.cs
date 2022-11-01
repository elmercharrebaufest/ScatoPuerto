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

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class BuqueController : BaseController
    {
        public BuqueController(IServicioRepositorio servicio) : base(servicio)
        {
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Buque/ListarHistorialDeBuques")]
        public HttpResponseMessage ListarHistorialDeBuques(int anio, int mes, int vaporId, DateTime? desde, DateTime? hasta)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarHistorialDeBuques(anio, mes, vaporId, desde, hasta));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Buque/ListarOperadores")]
        public HttpResponseMessage ListarOperadores(int Embarque_Id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarOperadores(Embarque_Id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }


        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Buque/GuardarHistoricoOperador")]
        public HttpResponseMessage ListarOperadores(int idEmbarque, string accion)
        {
            try
            {
                servicio.GuardarHistoricoActor(idEmbarque, accion, base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }


        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Buque/ListarPaises")]
        public HttpResponseMessage ObtenerPaises()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarPaises());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Buque/ObtenerVapores")]
        public HttpResponseMessage ObtenerVapores()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerVapores());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        //[HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        //[Route("api/Buque/GuardarVaporInformacion")]
        //public HttpResponseMessage GuardarVaporInformacion(List<VaporInformacionDto> vaporInformacionDto, int vapor_id)
        //{
        //    try
        //    {
        //        return Request.CreateResponse(HttpStatusCode.OK, servicio.GuardarVaporInformacion(vaporInformacionDto, vapor_id));
        //    }
        //    catch (Exception ex)
        //    {
        //        return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
        //    }
        //}
        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Buque/GuardarVaporInformacion")]
        public HttpResponseMessage GuardarVaporInformacion(List<VaporInformacionDto> VaporInformacionDto)
        {
            servicio.GuardarVaporInformacion(VaporInformacionDto);
            return Request.CreateResponse(HttpStatusCode.OK);
        }
        //[HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        //[Route("api/Buque/ObtenerVapores")]
        //public HttpResponseMessage ObtenerVaporInformacion(int vapor_id)
        //{
        //    try
        //    {
        //        return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerVaporInformacion(vapor_id));
        //    }
        //    catch (Exception ex)
        //    {
        //        return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
        //    }
        //}

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Buque/ObtenerVaporInformacion")]
        public HttpResponseMessage ObtenerVaporInformacion(int vapor_id)
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ObtenerVaporInformacion(vapor_id));
        }

        [HttpGet]
        [Route("api/Buque/ObtenerRegistroFechas")]
        public HttpResponseMessage ObtenerRegistroFechas(int idEmbarque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerRegistroFechas(idEmbarque));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }

        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Buque/ObtenerActores")]
        public HttpResponseMessage ObtenerActores(int idEmbarque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerActores(idEmbarque));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }

        }
    }
}
