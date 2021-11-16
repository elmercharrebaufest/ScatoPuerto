using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Orquestador;
using Molinos.Scato.Web.Atributos;
using Molinos.Scato.Web.Helpers;
using Molinos.Scato.Web.Models;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.Controllers
{
    [Autorizacion(PermisosScato.AbmPuestoDeTrabajo, PermisosScato.AbmModalidadPuestoDeTrabajo)]
    public class PuestoDeTrabajoController : BaseController
    {
        private readonly ILogger log;
        private readonly IServicioComandos servicioComandos;
        private readonly IServicioOrquestador servicioOrquestador;

        public PuestoDeTrabajoController(ILogger log, IServicioRepositorio servicio, IServicioComandos servicioComandos, IServicioOrquestador servicioOrquestador)
            : base(servicio)
        {
            this.log = log;
            this.servicioComandos = servicioComandos;
            this.servicioOrquestador = servicioOrquestador;
        }

        [DatosUsuario]
        public ActionResult Index(DatosUsuario datosUsuario, string filtro, int pagina = 1, string ordenarPor = "NombrePuesto", DirOrden dirOrden = DirOrden.Asc)
        {
            ListQuery(filtro, datosUsuario.CentroId, pagina, ordenarPor, dirOrden);
            return View();
        }

        [DatosUsuario]
        [AjaxOnly]
        [ActionName("Index")]
        public ActionResult Listar(DatosUsuario datosUsuario, string filtro, int pagina = 1, string ordenarPor = "NombrePuesto", DirOrden dirOrden = DirOrden.Asc)
        {
            ListQuery(filtro, datosUsuario.CentroId, pagina, ordenarPor, dirOrden);
            return View("Listar");
        }

        private void ListQuery(string filtro, int centroId, int pagina, string ordenarPor, DirOrden dirOrden)
        {
            var paginacion = new Paginacion(ordenarPor, dirOrden, pagina, 10);
            ViewBag.Items = servicio.ListarPaginadoPuestosDeTrabajo(filtro, centroId, paginacion);
        }

        [Autorizacion(PermisosScato.AbmPuestoDeTrabajo)]
        public ActionResult Crear()
        {
            SetearVista();
            return View(new PuestoDeTrabajoDto());
        }

        [Autorizacion(PermisosScato.AbmPuestoDeTrabajo)]
        [DatosUsuario]
        [HttpPost]
        public ActionResult Crear(DatosUsuario datosUsuario, string barrerasEntradaSupervisor, string barrerasEntrada, string videoCamarasJson, PuestoDeTrabajoDto model)
        {
            model.Entrada = string.IsNullOrEmpty(barrerasEntrada) ? "" : string.Join(",", barrerasEntrada.FromJson<SalidaDto[]>().Select(x => x.Codigo.Trim()));
            model.EntradaSupervisor = string.IsNullOrEmpty(barrerasEntradaSupervisor) ? "" : string.Join(",", barrerasEntradaSupervisor.FromJson<SalidaDto[]>().Select(x => x.Codigo.Trim()));
            if (!string.IsNullOrEmpty(videoCamarasJson))
            {
                model.VideoCamaras = videoCamarasJson.FromJson<VideoCamaraDto[]>().ToList();
            }
            if (ModelState.IsValid)
            {
                model.CentroId = datosUsuario.CentroId;
                var resultado = new Resultado();
                resultado.Error("NoSeEjecutoCrearPuesto", "El Comando CrearPuestoDeTrabajo No fue Ejecutado");

                if (string.IsNullOrEmpty(barrerasEntradaSupervisor) || barrerasEntradaSupervisor == "[]")
                {
                    ModelState.AddModelError("EntradaSupervisor", string.Format(Textos.Error_Requerido, Textos.PuestoDeTrabajo_EntradaSupervisor));
                }
                else
                {
                    resultado = servicioComandos.Ejecutar(new CrearPuestoDeTrabajo { Dto = model });
                }

                if (!resultado.HayErrores)
                {
                    return new AjaxEditSuccessResult();
                }

                ModelState.AgregarErrores(resultado);
            }
            SetearVista(model);
            return View(model);
        }

        [Autorizacion(PermisosScato.AbmPuestoDeTrabajo)]
        public ActionResult Modificar(int id)
        {
            var aModificar = servicio.ObtenerPuestoDeTrabajo(id);
            SetearVista(aModificar);
            return View(aModificar);
        }

        [Autorizacion(PermisosScato.AbmPuestoDeTrabajo)]
        [HttpPost]
        public ActionResult Modificar(PuestoDeTrabajoDto model, string barrerasEntradaSupervisor, string barrerasEntrada, string videoCamarasJson)
        {
            model.Entrada = string.IsNullOrEmpty(barrerasEntrada) ? "" : string.Join(",", barrerasEntrada.FromJson<SalidaDto[]>().Select(x => x.Codigo.Trim()));
            model.EntradaSupervisor = string.IsNullOrEmpty(barrerasEntradaSupervisor) ? "" : string.Join(",", barrerasEntradaSupervisor.FromJson<SalidaDto[]>().Select(x => x.Codigo.Trim()));
            if (!string.IsNullOrEmpty(videoCamarasJson))
            {
                model.VideoCamaras = videoCamarasJson.FromJson<VideoCamaraDto[]>().ToList();
            }
            if (ModelState.IsValid)
            {
                var resultado = new Resultado();
                resultado.Error("NoSeEjecutoCrearPuesto", "El Comando CrearPuestoDeTrabajo No fue Ejecutado");

                if (string.IsNullOrEmpty(barrerasEntradaSupervisor) || barrerasEntradaSupervisor == "[]")
                {
                    if (string.IsNullOrEmpty(barrerasEntradaSupervisor) || barrerasEntradaSupervisor == "[]")
                    {
                        ModelState.AddModelError("EntradaSupervisor", string.Format(Textos.Error_Requerido, Textos.PuestoDeTrabajo_EntradaSupervisor));
                    }
                }
                else
                {
                    resultado = servicioComandos.Ejecutar(new ModificarPuestoDeTrabajo { Dto = model });
                }

                if (!resultado.HayErrores)
                {
                    return new AjaxEditSuccessResult();
                }

                ModelState.AgregarErrores(resultado);
            }
            SetearVista(model);
            return View(model);
        }

        public ActionResult ModificarModalidad(int id)
        {
            var aModificar = servicio.ObtenerPuestoDeTrabajo(id);
            var model = new CambioModalidadPuestoModel
            {
                Id = aModificar.Id,
                Automatico = aModificar.Automatico,
            };
            return View(model);
        }

        [HttpPost]
        [DatosUsuario]
        public ActionResult ModificarModalidad(CambioModalidadPuestoModel model, DatosUsuario datosUsuario)
        {
            if (ModelState.IsValid)
            {
                var resultado = servicioComandos.Ejecutar(new ModificarModalidadPuestoDeTrabajo
                {
                    IdPuesto = model.Id,
                    Automatico = model.Automatico,
                    Motivo = model.Motivo,
                    Usuario = datosUsuario.NombreUsuario,
                    CentroId = datosUsuario.CentroId
                });
                if (!resultado.HayErrores)
                {
                    return new AjaxEditSuccessResult();
                }
                ModelState.AgregarErrores(resultado);
            }
            return View(model);
        }

        [Autorizacion(PermisosScato.AbmPuestoDeTrabajo)]
        [HttpPost]
        public ActionResult Eliminar(int id)
        {
            var resultado = servicioComandos.Ejecutar(new EliminarPuestoDeTrabajo { Id = id });
            return Content(!resultado.HayErrores ? "true" : resultado.Errores.Values.First());
        }

        public void SetearVista(PuestoDeTrabajoDto model = null)
        {
            var barreras = servicioOrquestador.ListarBarrerasSemaforos();
            ViewBag.Entrada = (model != null && model.Entrada != null ? barreras.Where(d => model.Entrada.Split(',').Contains(d.Codigo)) : new List<DispositivoDto>()).Select(d => new DispositivoPuestoTrabajoDto { Codigo = d.Codigo, Descripcion = d.Descripcion }).ToJson();
            ViewBag.EntradaSupervisor = (model != null && model.EntradaSupervisor != null ? barreras.Where(d => model.EntradaSupervisor.Split(',').Contains(d.Codigo)) : new List<DispositivoDto>()).Select(d => new DispositivoPuestoTrabajoDto { Codigo = d.Codigo, Descripcion = d.Descripcion }).ToJson();
            ViewBag.Lectores = servicioOrquestador.ListarLectores().ToSelectList(x => x.Codigo, x => x.Descripcion);
            ViewBag.Barreras = barreras.ToSelectList(x => x.Codigo, x => x.Descripcion);
            ViewBag.Camaras = servicioOrquestador.ListarCamaras().ToSelectList(x => x.Codigo, x => x.Descripcion);
            ViewBag.Sensores = servicioOrquestador.ListarSensores().ToSelectList(x => x.Codigo, x => x.Descripcion);
            ViewBag.LectoresQr = servicioOrquestador.ListarLectoresQr().ToSelectList(x => x.Descripcion, x => x.Descripcion);
            ViewBag.CartelesLed = servicioOrquestador.ListarCartelesLed().ToSelectList(x => x.Descripcion, x => x.Descripcion);

        }
    }
}
