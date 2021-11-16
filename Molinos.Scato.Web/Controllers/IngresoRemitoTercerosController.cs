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
    [Autorizacion(PermisosScato.ActividadIngresoRemitoTerceros)]
    public class IngresoRemitoTercerosController : DocumentoIngresoController
    {
        private readonly IServicioActividadFactory<IIngresoRemitoTercerosService> factory;
        private readonly IListaDeWorkflows workflows;

        public IngresoRemitoTercerosController(ILogger log, IServicioRepositorio servicio, IServicioActividadFactory<IIngresoRemitoTercerosService> factory, IServicioComandos servicioComandos, IListaDeWorkflows workflows)
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
            var ordenDeDescarga = servicio.ObtenerNumeroOrdenDeDescargaGenerado(datosUsuario.CentroId);
            SetearVista(workflowObj);
            return View(new RemitoDto{OrdenDeDescarga = ordenDeDescarga, FechaOD = DateTime.Today, EsRemitoProveedor = true});
        }

        [HttpPost]
        [DatosUsuario]
        public ActionResult Index(string workflow, RemitoDto orden, DatosUsuario datosUsuario)
        {
            var workflowObj = servicio.ObtenerWorkflowPorCodigo(workflow);
            if (datosUsuario.CentroId == 0)
            {
                TempData["Alerta"] = Textos.SeleccionarCentro_Error;
                TempData["TipoAlerta"] = TipoAlerta.Advertencia;
                return RedirectToAction("Index", "ListaDeCamiones");
            }

            var remito = servicio.ObtenerRemitoPorNroRemito(orden.Remito);
            if (remito != null)
            {
                ModelState.AddModelError("Remito", Textos.IngresarRemito_Existente);
                SetearVista(workflowObj);
                return View(orden);
            }

            var otroRecorridoDelChofer = servicio.ObtenerOtroRecorridoDelChofer(orden.Chofer.Id);
            if (otroRecorridoDelChofer != null)
            {
                ModelState.AddModelError("", string.Format(Textos.Error_ChoferYaEstaEnPlanta, orden.Chofer.NombreCompleto, otroRecorridoDelChofer.NumeroDocumentoIngreso, otroRecorridoDelChofer.Patente));
                SetearVista(workflowObj);
                return View(orden);
            }

            if (workflows.ObtenerWorkflowPorPatente(orden.PatenteCamion) != null)
            {
                TempData["Alerta"] = Textos.OrdenCargaInterna_PatenteEnOtroWorkflow;
                TempData["TipoAlerta"] = TipoAlerta.Advertencia;
                return RedirectToAction("Index", "ListaDeCamiones");
            }

            var resultadoChofer = SetearChofer(orden.Chofer);
            if (resultadoChofer == false)
            {
                SetearVista(workflowObj);
                return View(orden);  
            }
            var transportistaId = orden.TransportistaId;
            var resultadoTransportista = SetearTransportista(ref transportistaId, orden.TipoComercialId, orden.EsTransportista);
            orden.TransportistaId = transportistaId;
            if (!resultadoTransportista)
            {
                SetearVista(workflowObj);
                return View(orden);
            }

            orden.EsRemitoProveedor = true;
            orden.OrigenCodigoSap = servicio.ObtenerProveedor(orden.OrigenId).CodigoSap;
            orden.TipoDeWorkflow = workflowObj.TipoDeWorkflow;
            orden.PatenteCamion = orden.PatenteCamion != null ? orden.PatenteCamion.ToUpper() : "";
            orden.PatenteAcoplado = orden.PatenteAcoplado != null ? orden.PatenteAcoplado.ToUpper() : "";
            orden.Remito = orden.Remito.Replace('-', 'R');
            
            int workflowDefinicionId = servicio.ObtenerUltimaWorkflowDefinicionPorCordigo(workflow);
            var servicioWf = factory.CrearServicio(workflowDefinicionId);

            var controlRecorrido = new ControlRecorridoDto
                {
                    Actividad = Textos.ActIngresoRemitoTerceros,
                    ActividadXaml = "IngresoRemitoTerceros",
                    PuestoDeTrabajoId = datosUsuario.PuestoDeTrabajoId,
                    NombreUsuario = datosUsuario.NombreUsuario
                };

            var resultadoActividad = servicioWf.IngresoRemitoTerceros(orden, datosUsuario.CentroId, workflow, workflowDefinicionId, datosUsuario.NombreUsuario, controlRecorrido) as ResultadoCrearWorkflow;
            if (resultadoActividad.HayErrores)
            {
                ModelState.AgregarErrores(resultadoActividad);
                SetearVista(workflowObj);
                return View(orden);
            }

            return RedirectToAction("Index", "ListaDeCamiones", new { id = resultadoActividad.InstanciaWorkflowId });
        }

        private void SetearVista(WorkflowDto workflow)
        {
            var tiposComerciales = servicio.ListarTiposComercialesPorWfCodigo(workflow.Codigo);

            ViewBag.TiposComerciales = tiposComerciales.ToSelectList(f => f.Id.Value.ToString(CultureInfo.InvariantCulture), f => f.Descripcion);
            ViewBag.TiposComercialesTransportista = tiposComerciales.Where(x => !x.TransportistaEsProveedor).Select(y => y.Id.ToString()).ToList();
            ViewBag.TiposDocumentos = servicio.ListarTiposDocumentoIdentidad().ToSelectList(f => f.Id.ToString(), f => f.DescripcionCorta);
            ViewBag.Workflow = workflow.Codigo;
            ViewBag.EsIngreso = workflow.TipoDeWorkflow == TipoDeWorkflow.Ingreso;

            var materiales = servicio.ListarMaterialesPorWorkflow(workflow.Id, workflow.CentroId);
            ViewBag.Materiales = materiales.ToSelectList(f => f.MaterialId.ToString(CultureInfo.InvariantCulture), f => f.MaterialDesc);
            ViewBag.MaterialesConAnexo = materiales.Where(x => x.RequiereAnexoInase).Select(y => y.MaterialId.ToString()).ToList();
        }
    }
}