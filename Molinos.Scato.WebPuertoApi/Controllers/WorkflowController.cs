using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class WorkflowController : BaseController
    {
        private readonly IListaDeWorkflows workflows;
        private readonly IServicioComandos servicioComandos;

        public WorkflowController(IServicioRepositorio servicio, IListaDeWorkflows workflows, IServicioComandos servicioComandos) : base(servicio)
        {
            this.workflows = workflows;
            this.servicioComandos = servicioComandos;
        }

        //[Autorizacion(PermisosScato.LineUpLectura)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [HttpGet]
        [Route("api/Workflow/Listar")]
        public HttpResponseMessage Listar()
        {
            //  var embarques = workflows.ListarEmbarques();
            var embarques = servicio.ListarEmbarques();
            return Request.CreateResponse(HttpStatusCode.OK, embarques);
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Workflow/ListarEnLineUp")]
        public HttpResponseMessage ListarEnLineUp()
        {
            //   var embarques = workflows.ListarEmbarques();
            var embarques = servicio.ListarEmbarques();
            var ubicaciones = servicio.ListarUbicacionDeBuquePuerto();
            return Request.CreateResponse(HttpStatusCode.OK,
                            embarques
                                .Where(y => y.Embarque.SanBenito || y.Embarque.Vicentin || y.Embarque.Noryon)
                                .Select(x => new EmbarqueNavDto
                                {
                                    Id = x.Embarque.Id,
                                    PlanoDeCargaId = x.LineUp.PlanoDeCarga != null ? x.LineUp.PlanoDeCarga.Id : 0,
                                    ModuloDeCargaId = x.LineUp.ModuloDeCarga != null ? x.LineUp.ModuloDeCarga.Id : 0,
                                    NombreBuque = x.Embarque != null ? x.Embarque.NombreBuque : "",
                                    Cargado = x.LineUp.PlanoDeCarga != null && x.LineUp.PlanoDeCarga.Cargado,
                                    NombreUbicacion = ubicaciones.Where(z => z.Id == x.Embarque.Ubicacion).FirstOrDefault()?.Nombre,
                                    EsLiquido = x.Embarque.EsLiquido,
                                    Muelle = x.Embarque.SanBenito ? "sanBenito" : x.Embarque.Vicentin ? "vicentin" : "noryon"
                                }).ToList()
                        );
        }

        [HttpGet]
        [Route("api/Workflow/Eliminar")]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        public HttpResponseMessage Eliminar(Guid id)
        {
            var resultado = EliminarEmbarqueRecorrido(servicio, servicioComandos, nombreUsuario, id);
            return string.IsNullOrEmpty(resultado) ? Request.CreateResponse(HttpStatusCode.OK) : Request.CreateResponse(HttpStatusCode.InternalServerError, resultado);
        }

        public static string EliminarEmbarqueRecorrido(IServicioRepositorio servicio, IServicioComandos servicioComandos, string nombreUsuario, Guid id)
        {
            var recorridoId = servicio.ObtenerRecorridoIdPorGuid(id);
            var resultado = servicioComandos.Ejecutar(new EliminarRecorrido { Id = recorridoId, NombreUsuario = nombreUsuario }) as ResultadoEliminarRecorrido;
            if (resultado != null && resultado.HayErrores)
            {
                return resultado.Errores.Values.First();
            }
            return null;
        }
    }
}