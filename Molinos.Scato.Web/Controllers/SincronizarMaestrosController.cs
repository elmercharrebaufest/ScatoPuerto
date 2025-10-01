using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Servicios;
using Molinos.Scato.Web.Atributos;
using Molinos.Scato.Web.Helpers;
using Molinos.Scato.Web.Models;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace Molinos.Scato.Web.Controllers
{
    public class SincronizarMaestrosController : Controller
    {
        private readonly IServicioComandos servicioComandos;
        private readonly IServicioRepositorio servicioRepositorio;
        private ILogger log;

        public SincronizarMaestrosController(IServicioComandos servicioComandos, IServicioRepositorio servicioRepositorio, ILogger log)
        {
            this.servicioComandos = servicioComandos;
            this.servicioRepositorio = servicioRepositorio;
            this.log = log;
        }

        public ActionResult Proveedores(bool mostrarResultados = true)
        {
            log.Info("Ejecutando sincronización de Proveedores. Mostrar resultados: {0}", mostrarResultados);
            var resultado = servicioComandos.Ejecutar(new SincronizarProveedores { RetornarResultado = mostrarResultados, CargaMasiva = true }) as ResultadoSincronizarProveedores;
            ModelState.AgregarErrores(resultado);
            if (mostrarResultados)
            {
                ModelState.AgregarErrores(resultado);
                return View(resultado);
            }
            return Content(string.Empty);
        }

        public ActionResult Clientes(bool mostrarResultados = true)
        {
            log.Info("Ejecutando sincronización de Clientes. Mostrar resultados: {0}", mostrarResultados);
            var resultado = servicioComandos.Ejecutar(new SincronizarClientes { RetornarResultado = mostrarResultados, CargaMasiva = true }) as ResultadoSincronizarClientes;
            ModelState.AgregarErrores(resultado);
            if (mostrarResultados)
            {
                ModelState.AgregarErrores(resultado);
                return View(resultado);
            }
            return Content(string.Empty);
        }

        public ActionResult Materiales(bool mostrarResultados = true)
        {
            log.Info("Ejecutando sincronización de Materiales. Mostrar resultados: {0}", mostrarResultados);
            var resultado = servicioComandos.Ejecutar(new SincronizarMateriales { RetornarResultado = mostrarResultados, CargaMasiva = true }) as ResultadoSincronizarMateriales;
            if (mostrarResultados)
            {
                ModelState.AgregarErrores(resultado);
                return View(resultado);
            }
            return Content(string.Empty);
        }

        public void ActualizarCuposOtorgados()
        {
            var centros = servicioRepositorio.ListarCentros().Select(centro => (centro.CodigoSAP + ',' + centro.CodigoSAPEspecial).Split(',').Where(x => !string.IsNullOrEmpty(x)));
            servicioComandos.Ejecutar(new ActualizarCuposOtorgados { CentrosCodigoSap = centros.SelectMany(x => x).ToArray(), Fecha = DateTime.Now });
        }

        public void ActualizarEstadoPlanta()
        {
            var centros = servicioRepositorio.ListarCentros().Select(centro => (centro.CodigoSAP + ',' + centro.CodigoSAPEspecial).Split(',').Where(x => !string.IsNullOrEmpty(x)));
            servicioComandos.Ejecutar(new ActualizarEstadoMaterial());
        }

        public void ActualizarStock(DateTime? fecha = null, int diasAtras = 0)
        {
            fecha = fecha ?? DateTime.Now;
            var fechaInicio = fecha.Value.AddDays(diasAtras * -1);
            for (var i = 0; fechaInicio <= fecha; i++)
            {
                servicioComandos.Ejecutar(new ActualizarStock() { Fecha = fechaInicio });
                fechaInicio = fechaInicio.AddDays(1);
            }
        }

    }
}