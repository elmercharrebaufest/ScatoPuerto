using System;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Web.Atributos;
using Molinos.Scato.Web.Helpers;
using Molinos.Scato.Web.Models;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.Controllers
{
    [Autorizacion(PermisosScato.ActividadIngresarOrdenCargaInterna)]
    public class IngresarOrdenCargaInternaController : DocumentoIngresoController
    {
        private readonly IServicioActividadFactory<IIngresarOrdenCargaInternaService> factory;
        private readonly IListaDeWorkflows workflows;

        public IngresarOrdenCargaInternaController(ILogger log, IServicioRepositorio servicio, IServicioActividadFactory<IIngresarOrdenCargaInternaService> factory, IServicioComandos servicioComandos, IListaDeWorkflows workflows)
            : base(log, servicio, servicioComandos)
        {
            this.factory = factory;
            this.workflows = workflows;
        }

        [DatosUsuario]
        public ActionResult Index(string workflow, DatosUsuario datosUsuario)
        {
            if (!servicio.WorkflowActivoConDefinicionActiva(workflow))
            {
                return RedirectToAction("Index", "ListaDeCamiones");
            }

            var workflowObj = servicio.ObtenerWorkflowPorCodigo(workflow);
            SetearVista(workflowObj, datosUsuario.CentroId);

            var numeroOrden = servicio.ObtenerNumeroDocumentoGenerado().ToString(CultureInfo.InvariantCulture).PadLeft(8, '0');
            return View(new OrdenCargaInternaDto{FechaEmision = DateTime.Now, NumeroOrden = numeroOrden});
        }

        [HttpPost]
        [DatosUsuario]
        public ActionResult Index(string workflow, OrdenCargaInternaDto orden, DatosUsuario datosUsuario)
        {
            var workflowObje = servicio.ObtenerWorkflowPorCodigo(workflow);

            if (orden.PatenteCamion != null)
            {
                orden.PatenteCamion = orden.PatenteCamion.ToUpper();
            }
            if (orden.PatenteAcoplado != null)
            {
                orden.PatenteAcoplado = orden.PatenteAcoplado.ToUpper();
            }

            if (workflows.ObtenerWorkflowPorPatente(orden.PatenteCamion) != null)
            {
                TempData["Alerta"] = Textos.PatenteEnOtroWorkflow;
                TempData["TipoAlerta"] = TipoAlerta.Advertencia;
                return RedirectToAction("Index", "ListaDeCamiones");
            }

            var resultadoChofer = SetearChofer(orden.Chofer);
            if (resultadoChofer == false)
            {
                        var workflowObj = servicio.ObtenerWorkflowPorCodigo(workflow);
                        SetearVista(workflowObj, datosUsuario.CentroId);
                        return View(orden);
                    }

            var transportistaId = orden.TransportistaId;
            var resultadoTransportista = SetearTransportista(ref transportistaId, orden.TipoComercialId, orden.EsTransportista);
            orden.TransportistaId = transportistaId;
            if (!resultadoTransportista)
            {
                var workflowObj = servicio.ObtenerWorkflowPorCodigo(workflow);
                SetearVista(workflowObj, datosUsuario.CentroId);
                return View(orden);
            }

            var controlRecorrido = new ControlRecorridoDto
                    {
                    Actividad = Textos.ActIngresarOrdenCargaInterna,
                    ActividadXaml = "IngresarOrdenCargaInterna",
                    PuestoDeTrabajoId = datosUsuario.PuestoDeTrabajoId,
                    NombreUsuario = datosUsuario.NombreUsuario
                };
            
            if (!Validar(orden, datosUsuario))
            {
                SetearVista(workflowObje, datosUsuario.CentroId);
                return View(orden);
            }

            int workflowDefinicionId = servicio.ObtenerUltimaWorkflowDefinicionPorCordigo(workflow);
            var servicioWf = factory.CrearServicio(workflowDefinicionId);
            var resultadoActividad = servicioWf.IngresarOrdenCargaInterna(orden, datosUsuario.CentroId, workflow, workflowDefinicionId, datosUsuario.NombreUsuario, controlRecorrido) as ResultadoCrearWorkflow;
            
            if (!resultadoActividad.HayErrores)
            {
                return RedirectToAction("Index", "ListaDeCamiones", new { id = resultadoActividad.InstanciaWorkflowId });
            }

            ModelState.AgregarErrores(resultadoActividad);
            SetearVista(workflowObje, datosUsuario.CentroId);
            return View(orden);
        }

        private void SetearVista(WorkflowDto workflow, int centroId)
        {
            SetearVista(workflow, centroId, servicio, this);
        }

        public static void SetearVista(WorkflowDto workflow, int centroId, IServicioRepositorio servicio, ControllerBase controller)
        {
            var tiposComerciales = servicio.ListarTiposComercialesPorWfCodigo(workflow.Codigo);
            var pesoMaximoPorTipoVehiculo = servicio.ListarPesoMaximoPorTipoVehiculoPorCentro(centroId);

            controller.ViewBag.TiposComerciales = tiposComerciales.ToSelectList(f => f.Id.Value.ToString(CultureInfo.InvariantCulture), f => f.Descripcion);
            controller.ViewBag.TiposComercialesTransportista = tiposComerciales.Where(x => !x.TransportistaEsProveedor).Select(y => y.Id.ToString()).ToList();
            controller.ViewBag.Materiales = servicio.ListarMaterialesPorWorkflow(workflow.Id, centroId).ToSelectList(f => f.MaterialId.ToString(), f => f.MaterialDesc);
            controller.ViewBag.TiposDocumentos = servicio.ListarTiposDocumentoIdentidad().ToSelectList(f => f.Id.ToString(), f => f.DescripcionCorta);
            controller.ViewBag.Workflow = workflow.Codigo;
            controller.ViewBag.CentroId = centroId;
            controller.ViewBag.TiposVehiculo = pesoMaximoPorTipoVehiculo.Where(x => x.TipoVehiculo != TipoVehiculo.Tren ).ToSelectList(f => ((int)f.TipoVehiculo).ToString(), f => f.TipoVehiculo.DisplayText());
            controller.ViewBag.WorkflowId = workflow.Id;
            controller.ViewBag.WorkflowDescripcion = workflow.Descripcion;

        }

        protected virtual bool Validar(OrdenCargaInternaDto orden, DatosUsuario usuario)
        {
            return true;
        }
    }
}