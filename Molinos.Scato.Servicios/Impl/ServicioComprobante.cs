using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.GestionarCartasDePortePE;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioComprobante : IServicioComprobante
    {
        private readonly IRepositorio _repositorio;
        private readonly IConversor _conversor;
        private readonly ILogger _log;
        private readonly IServicioComandos _servicioComandos;
        private readonly IServicioRepositorio _servicioRepositorio;

        public ServicioComprobante(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioComandos comandos, IServicioRepositorio servicioRepositorio)
        {
            _repositorio = repositorio;
            _conversor = conversor;
            _log = log;
            _servicioComandos = comandos;
            _servicioRepositorio = servicioRepositorio;
        }

        public string ObtenerNumeroInicioComprobante()
        {
            var parametro = _repositorio.Obtener<Parametros>(p => p.Descripcion == "NumeroInicioComprobante") ?? throw new Exception("El parámetro NumeroInicioComprobante no está presente en la base de datos");
            return parametro.Parametro3;
        }

        public void GuardarNumeroInicioComprobante(string numeroInicioComprobante, string usuario)
        {
            _log.Info("Se va a guardar el nuevo número de inicio de comprobante");

            var parametro = _repositorio.Obtener<Parametros>(p => p.Descripcion == "NumeroInicioComprobante") ?? throw new Exception("El parámetro NumeroInicioComprobante no está presente en la base de datos");
            var valorAnterior = parametro.Parametro3;
            parametro.Parametro3 = numeroInicioComprobante;

            var logABM = new LogABM
            {
                Pantalla = "GuardarNumeroInicioComprobante",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = $"{valorAnterior} -> {numeroInicioComprobante}"
            };
            _repositorio.Agregar(logABM);

            _repositorio.GuardarCambios();

            _log.Info($"El usuario {usuario} ha modificado el número de inicio de comprobante de {valorAnterior} a {numeroInicioComprobante}");
        }
    }
}
