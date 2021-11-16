using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Web.Atributos;
using Molinos.Scato.Web.Helpers;
using Molinos.Scato.Web.Models;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.Controllers
{
    [Autorizacion(PermisosScato.ActividadAsignacionDeEstablecimiento)]
    public class AsignacionDeEstablecimientoController : BaseController
    {
        private readonly IServicioActividadFactory<IAsignacionDeEstablecimientoService> factory;
        private ILogger log;

        public AsignacionDeEstablecimientoController(ILogger log, IServicioActividadFactory<IAsignacionDeEstablecimientoService> factory, IServicioRepositorio servicio)
            : base(servicio)
        {
            this.factory = factory;
            this.log = log;
        }
        public ActionResult Index(Guid id)
        {
            ViewBag.HayErrores = false;
            return View(SetearVista(id));
        }

        [HttpPost]
        [DatosUsuario]
        public ActionResult Index(AsignacionDeEstablecimientoDto model, DatosUsuario datosUsuario)
        {
            if (ModelState.IsValid)
            {
                var controlRecorrido = new ControlRecorridoDto
                    {
                        Actividad = Textos.ActAsignacionDeEstablecimiento,
                        ActividadXaml = "AsignacionDeEstablecimiento",
                        WorkflowInstanceId = model.InstanceId,
                        PuestoDeTrabajoId = datosUsuario.PuestoDeTrabajoId,
                        NombreUsuario = datosUsuario.NombreUsuario
                    };

                int? establecimiento;
                if (model.EstablecimientoId > 0)
                {
                    establecimiento = model.EstablecimientoId;
                }
                else
                {
                    establecimiento = null;  
                }
                var accesoService = factory.CrearServicio(model.WorkflowDefinicionId);
                if (model.TipoVehiculo == TipoVehiculo.Tren)
                {
                    var vagones = servicio.ObtenerGuidVagones(model.InstanceId);
                    foreach(var vagon in vagones)
                    {
                        var resultado = accesoService.AsignacionDeEstablecimiento(vagon, establecimiento, controlRecorrido);
                        ViewBag.HayErrores = resultado.HayErrores;
                        if (resultado.HayErrores)
                        {
                            log.Error("AsignacionDeEstablecimiento Error : {0} , id = {1}", resultado.Errores.FirstOrDefault().Value, vagon);
                            TempData["Alerta"] = resultado.Errores.FirstOrDefault().Value;
                            TempData["TipoAlerta"] = TipoAlerta.Error;
                            SetearVista(model.InstanceId);
                            return View(model);
                        }
                    }
                    return RedirectToAction("Index", "ListaDeCamiones");
                }
                else
                {
                    var resultado = accesoService.AsignacionDeEstablecimiento(model.InstanceId, establecimiento, controlRecorrido);
                    ViewBag.HayErrores = resultado.HayErrores;
                    if (resultado.HayErrores)
                    {
                        log.Error("AsignacionDeEstablecimiento Error : {0} , id = {1}", resultado.Errores.FirstOrDefault().Value, model.InstanceId);
                        TempData["Alerta"] = resultado.Errores.FirstOrDefault().Value;
                        TempData["TipoAlerta"] = TipoAlerta.Error;
                    }
                    else
                    {
                        return RedirectToAction("Index", "ListaDeCamiones");
                    }
                }
            }
            SetearVista(model.InstanceId);
            return View(model);
        }

        
        private AsignacionDeEstablecimientoDto SetearVista(Guid instanceId)
        {
            var model = servicio.ObtenerAsignacionDeEstablecimiento(instanceId);
            var establecimientos = new List<SelectListItem>();
            establecimientos.AddRange(model.Establecimientos.Select(establecimiento => new SelectListItem {Selected = false, Text = establecimiento.NombreDeEstablecimiento, Value = establecimiento.Id.ToString(CultureInfo.InvariantCulture)}));
            establecimientos = establecimientos.OrderBy(x => x.Text).ToList();
            establecimientos.Insert(0, new SelectListItem { Selected = false, Text = Textos.Default_Establecimiento, Value = "-1" });
            ViewBag.Establecimientos = establecimientos;
            ViewBag.RecorridoId = model.RecorridoId;

            var foto = servicio.ObtenerFotoCPDeCartaDePortePorrecorrido(instanceId);
            if (foto.Fotos.Any())
            {
                ViewBag.FotoMesaDigitalizacion1 = foto.Fotos.First().Foto;
            }

            return model;
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public JsonResult ProcedenciaCartaPorteIgualALocalidadEstablecimiento(string instanceId,string establecimientoId)
        {
            var instance = new Guid(instanceId);
            var cartaPorte = servicio.ObtenerCartaPortePorInstanceId(instance);

            var establecimiento =  establecimientoId != "" ? servicio.ObtenerEstablecimiento(Convert.ToInt32(establecimientoId)) : null;
            return establecimientoId != "-1" && !String.IsNullOrEmpty(establecimientoId) && cartaPorte != null && establecimiento != null
                       ? Json(establecimiento.LocalidadId == cartaPorte.ProcedenciaId, JsonRequestBehavior.AllowGet)
                       : Json(true, JsonRequestBehavior.AllowGet);
        }

        [DatosUsuario]
        public ActionResult Rechazar(string codigoWf, int workflowDefinicionId, Guid instanceId, DatosUsuario datosUsuario)
        {
            log.Info("{0} - AsignacionDeEstablecimiento Rechazar", instanceId);
            ViewBag.Motivos = servicio.ListarMotivos().ToSelectList(x => x.Descripcion, x => x.Descripcion);
            ViewBag.Workflow = codigoWf;
            ViewBag.WorkflowDefinicionId = workflowDefinicionId;
            var controlRecorrido = new ControlRecorridoDto
            {
                WorkflowInstanceId = instanceId,
                NombreUsuario = datosUsuario.NombreUsuario,
                Actividad = Textos.AsignacionDeEstablecimiento_Titulo + "/" + Textos.Rechazar,
                ActividadXaml = "AsignacionDeEstablecimiento",
                PuestoDeTrabajoId = datosUsuario.PuestoDeTrabajoId
            };

            return View("_TransportistaRechazado", controlRecorrido);
        }

        [DatosUsuario]
        public ActionResult TransportistaRechazado(string workflow, int workflowDefinicionId, Guid workflowInstanceId, ControlRecorridoDto controlRecorrido)
        {
            log.Info("{0} - AsignacionDeEstablecimiento rechazado", workflowDefinicionId);
            controlRecorrido.Decision = true;
            var service = factory.CrearServicio(workflowDefinicionId);
            var resultado = service.AsignacionDeEstablecimiento(workflowInstanceId, null, controlRecorrido);
            if (!resultado.HayErrores)
            {
                return RedirectToAction("Index", "ListaDeCamiones");
            }
            ModelState.AgregarErrores(resultado);
            return RedirectToAction("Index", new { id = controlRecorrido.WorkflowInstanceId });
        }
    }
}
