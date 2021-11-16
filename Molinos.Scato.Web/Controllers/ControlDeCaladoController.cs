using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Web.Atributos;
using Molinos.Scato.Web.Models;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.Controllers
{
    [Autorizacion(PermisosScato.ControlDeCalado)]
    public class ControlDeCaladoController : BaseController
    {
        private ILogger log;

        public ControlDeCaladoController(ILogger log, IServicioRepositorio servicio, IConfiguracionProvider config) 
            : base(servicio)
        {
            this.log = log;
        }

        [DatosUsuario]
        public ActionResult Index(DatosUsuario datosUsuario)
        {
            var model = this.cargarModel(datosUsuario.CentroId, DateTime.Now.AddHours(-8), DateTime.Now);
            return View(model);
        }

        [DatosUsuario]
        public ActionResult Listar(DatosUsuario datosUsuario, ControlDeCaladoModel modelRecivido)
        {
            var model = this.cargarModel(datosUsuario.CentroId, modelRecivido.FechaDesde, modelRecivido.FechaHasta);

            return View("_Listar", model);
        }
        
        private ControlDeCaladoModel cargarModel(int centroId, DateTime desde, DateTime hasta)
        {
            var model = new ControlDeCaladoModel();
            model.FechaDesde = desde;
            model.FechaHasta = hasta;
            model.CaladosPorHora = servicio.CaladosPorHora(desde, hasta);
            model.UltimoCamion = servicio.UltimoCalado(desde, hasta, centroId);
            model.EstadisticasCalado = servicio.ObtenerEstadisticasCalado(desde, hasta, centroId);
            
            return model;
        }
    }
}
