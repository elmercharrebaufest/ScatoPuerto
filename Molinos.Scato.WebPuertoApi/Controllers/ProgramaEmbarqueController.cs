using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class ProgramaEmbarqueController : BaseController
    {
        private readonly IServicioProgramaEmbarque servicioProgramaEmbarque;
        private readonly IServicioComandos servicioComandos;
        public ProgramaEmbarqueController(IServicioRepositorio servicio,
            IServicioProgramaEmbarque programaEmbarque,
            IServicioComandos servicioComandos) : base(servicio)
        {

        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarMuelleDeCarga")]
        public HttpResponseMessage ListarMuelleDeCarga()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarMuelleDeCarga());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        //[Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/ProgramaEmbarque/ObtenerDatosComboProgramaEmbarque")]
        public HttpResponseMessage ObtenerDatosComboProgramaEmbarque()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicioProgramaEmbarque.ListarDatosCombo()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ProgramaEmbarque/ListarProgramaEmbarque")]
        public HttpResponseMessage ListarProgramaEmbarque(int? pagina = null, int? itemsPorPagina = null, DateTime? fecha = null, string muelle = null, string buque = null, string producto = null)
        {
            try
            {                
                var paginacion = new Paginacion(null, DirOrden.Desc, ( pagina == null) ? 0 : pagina.Value, (itemsPorPagina == 0 || !itemsPorPagina.HasValue) ? 10 :itemsPorPagina.Value);              
                var response = servicioProgramaEmbarque.ListarProgramaDeEmbarque(paginacion, fecha,
                    (!string.IsNullOrEmpty(muelle) ? muelle.Split(',').ToList() : null),
                    (!string.IsNullOrEmpty(buque) ? buque.Split(',').ToList() : null),
                    (!string.IsNullOrEmpty(producto) ? producto.Split(',').ToList() : null));
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        //[Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/ProgramaEmbarque/ObtenerNominacion")]
        public HttpResponseMessage ObtenerNominacion(int id)
        {
            try
            {

           
            var nominacion = servicioProgramaEmbarque.ObtenerNominacion(id);
            return Request.CreateResponse(HttpStatusCode.OK,
                nominacion
            );
            }
            catch (Exception ex)
            {

                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }



        [HttpGet]

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarSurveyor")]
        public HttpResponseMessage ListarSurveyor()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarSurveyor());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarTasaDeCarga")]
        public HttpResponseMessage ListarTasaDeCarga()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarTasaDeCarga());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarTipoDeContrato")]
        public HttpResponseMessage ListarTipoDeContrato()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarTipoDeContrato());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarCalidadValor")]
        public HttpResponseMessage ListarCalidadValor()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarCalidadValor());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarTipoDeCalidad")]
        public HttpResponseMessage ListarTipoDeCalidad()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarTipoDeCalidad());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

    }
}
