using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Web.Atributos;
using Molinos.Scato.Web.Helpers;
using Molinos.Scato.Web.Models;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.Controllers
{
    [Autorizacion(PermisosScato.AbmAsignacionDeRecorrido)]
    public class AsignacionDeRecorridoController : BaseController
    {
        private readonly ILogger log;
        private readonly IServicioComandos servicioComandos;

        public AsignacionDeRecorridoController(ILogger log, IServicioRepositorio servicio, IServicioComandos servicioComandos)
            : base(servicio)
        {
            this.log = log;
            this.servicioComandos = servicioComandos;
        }

        [DatosUsuario]
        public ActionResult Index(DatosUsuario datosUsuario, string filtro, int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Asc)
        {
            ListQuery(filtro, pagina, ordenarPor, dirOrden, datosUsuario.CentroId);
            return View((object)filtro);
        }

        [AjaxOnly]
        [ActionName("Index")]
        [DatosUsuario]
        public ActionResult Listar(DatosUsuario datosUsuario, string filtro, int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Asc)
        {
            ListQuery(filtro, pagina, ordenarPor, dirOrden, datosUsuario.CentroId);
            return View("Listar", (object)filtro);
        }

        private void ListQuery(string filtro, int pagina, string ordenarPor, DirOrden dirOrden, int centroId)
        {
            var paginacion = new Paginacion(ordenarPor, dirOrden, pagina, 10);

            ViewBag.Items = servicio.ListarPaginadoAsignacionesDeRecorrido(centroId, filtro, paginacion);
        }

        [DatosUsuario]
        public ActionResult Crear(DatosUsuario datosUsuario)
        {
            CargarCombos(datosUsuario.CentroId);
            return View(new AsignacionDeRecorridoDto {FechaDesde = DateTime.Today, FechaHasta = DateTime.Today});
        }


        [DatosUsuario]
        [HttpPost]
        public ActionResult Crear(AsignacionDeRecorridoDto model, DatosUsuario datosUsuario)
        {
            ModelState.Remove("CalidadId");
            if (ModelState.IsValid)
            {
                model.CentroId = datosUsuario.CentroId;
                var resultado = servicioComandos.Ejecutar(new CrearAsignacionDeRecorrido { Dto = model });
                if (!resultado.HayErrores)
                {
                    return new AjaxEditSuccessResult();
                }
                ModelState.AgregarErrores(resultado);
            }
            CargarCombos(datosUsuario.CentroId, model);
            return View(model);
        }

        [DatosUsuario]
        public ActionResult Modificar(int id, DatosUsuario datosUsuario)
        {
            var asignacionAModificar = servicio.ObtenerAsignacionDeRecorrido(id);
            CargarCombos(datosUsuario.CentroId, asignacionAModificar);
            return View(asignacionAModificar);

        }

        [DatosUsuario]
        [HttpPost]
        public ActionResult Modificar(AsignacionDeRecorridoDto model, DatosUsuario datosUsuario)
        {
            ModelState.Remove("CalidadId");
            if (ModelState.IsValid)
            {
                model.CentroId = datosUsuario.CentroId;
                var resultado = servicioComandos.Ejecutar(new ModificarAsignacionDeRecorrido { Dto = model });
                if (!resultado.HayErrores)
                {
                    return new AjaxEditSuccessResult();
                }
                ModelState.AgregarErrores(resultado);
            }
            CargarCombos(datosUsuario.CentroId, model);
            return View(model);
        }

        [HttpPost]
        public ActionResult Eliminar(int id)
        {
            var resultado = servicioComandos.Ejecutar(new EliminarAsignacionDeRecorrido { Id = id });
            return Content(!resultado.HayErrores ? "true" : resultado.Errores.Values.First());
        }

        private void CargarCombos(int centroId, AsignacionDeRecorridoDto model = null)
        {
            if (model == null)
            {
                model = new AsignacionDeRecorridoDto {MaterialPorCentroId = -1};
            }

            ViewBag.Calidades =
                servicio.ListarCalidadesPorMaterialyCentro(model.MaterialPorCentroId)
                        .ToSelectList(x => x.Id.ToString(CultureInfo.InvariantCulture), x => x.Descripcion);
            ViewBag.Workflows =
                servicio.ListarWorkflowsPorCentro(centroId).Where(w => w.Activo)
                        .ToSelectList(x => x.Id.ToString(CultureInfo.InvariantCulture), x => x.Descripcion);
            ViewBag.Calles =
                servicio.ListarCalles(centroId)
                        .ToSelectList(x => x.Id.ToString(CultureInfo.InvariantCulture), x => x.Nombre,
                                      model.CalleId.ToString(CultureInfo.InvariantCulture));
            var balanzas = servicio.ListarBalanzas(centroId, Dominio.Enums.TipoVehiculo.Camión);
            ViewBag.BalanzasBruto = balanzas.ToSelectList(x => x.Id.ToString(CultureInfo.InvariantCulture), x => x.Nombre,
                                      (model.BalanzaBrutoId ?? 0).ToString(CultureInfo.InvariantCulture));
            ViewBag.BalanzasTara = balanzas.ToSelectList(x => x.Id.ToString(CultureInfo.InvariantCulture), x => x.Nombre,
                                      (model.BalanzaTaraId ?? 0).ToString(CultureInfo.InvariantCulture));
            ViewBag.Almacenes =
                servicio.ListarAlmacenesPorCentro(centroId)
                        .ToSelectList(x => x.Id.ToString(CultureInfo.InvariantCulture), x => x.Descripcion,
                                      model.AlmacenDestinoId.ToString(CultureInfo.InvariantCulture));
            ViewBag.Hidraulicas = new MultiSelectList(servicio.ListarHidraulicas(centroId,false), "Id", "Nombre");

        }

        public JsonResult CargarCalidades(int? materialPorCentroId)
        {
            if (materialPorCentroId.HasValue && materialPorCentroId != 0)
            {
                var calidades =
                    servicio.ListarCalidadesPorMaterialyCentro(materialPorCentroId.Value)
                            .ToSelectList(x => x.Id.ToString(CultureInfo.InvariantCulture), x => x.Descripcion);
                return Json(new { calidades = calidades}, JsonRequestBehavior.AllowGet);
            }
            return Json(new { calidades = new List<SelectList>() }, JsonRequestBehavior.AllowGet);
        }

    }
}
