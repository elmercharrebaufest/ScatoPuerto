using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
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

        public ComprobantePuertoDto GenerarRomaneo(int moduloDeCargaId, string usuario)
        {
            _log.Info($"El usuario ${usuario} va a generar un romaneo para el módulo de carga con ID {moduloDeCargaId}");
            var res = (ResultadoCrear)_servicioComandos.Ejecutar(new GenerarRomaneoPuerto { ModuloDeCargaId = moduloDeCargaId, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            _log.Info($"El usuario ${usuario} ha generado el romaneo correctamente");
            return ObtenerRomaneo(res.Id);
        }

        public ComprobantePuertoDto ObtenerRomaneo(int romaneoId)
        {
            var romaneo = _repositorio.Obtener<RomaneoPuerto>(romaneoId) ?? throw new Exception($"No se encontró el romaneo con ID {romaneoId}");
            return _conversor.Convertir<RomaneoPuerto, ComprobantePuertoDto>(romaneo);
        }

        public List<ComprobantePuertoDto> ListarComprobantes(int moduloDeCargaId)
        {
            var romaneos = _repositorio.Listar<RomaneoPuerto>(r => r.ModuloDeCarga.Id == moduloDeCargaId).ToList();
            var comprobantes = _conversor.Convertir<List<RomaneoPuerto>, List<ComprobantePuertoDto>>(romaneos);
            // TODO: Listar tambien las cargas reales y unirlas al listado de comprobantes. Luego ordenar todo por fecha de emision.
            return comprobantes;
        }

        public void GuardarFechaImpresionRomaneo(int romaneoId, string usuario)
        {
            _log.Info($"El usuario {usuario} va a imprimir el romaneo con ID {romaneoId}");
            var romaneo = _repositorio.Obtener<RomaneoPuerto>(romaneoId) ?? throw new Exception($"No se encontró el romaneo con ID {romaneoId}");
            var fechaAnterior = romaneo.FechaImpresion?.ToString("dd/MM/yyyy HH:mm") ?? "-";
            var usuarioAnterior = romaneo.UsuarioEmision ?? "-";
            romaneo.FechaImpresion = DateTime.Now;
            romaneo.UsuarioEmision = usuario;

            var logAbm = new LogABM
            {
                Pantalla = "GuardarFechaImpresionRomaneo",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = $"{usuarioAnterior} {fechaAnterior} -> {romaneo.UsuarioEmision} {romaneo.FechaImpresion?.ToString("dd/MM/yyyy HH:mm")}",
                ClaseId = romaneoId
            };

            _repositorio.Agregar(logAbm);
            _repositorio.GuardarCambios();

            _log.Info($"El usuario {usuario} ha guardado la fecha de impresión del romaneo con ID {romaneoId} correctamente");
        }

        public void AnularRomaneo(int romaneoId, string usuario)
        {
            _log.Info($"El usuario {usuario} va a anular el romaneo con ID {romaneoId}");
            var romaneo = _repositorio.Obtener<RomaneoPuerto>(romaneoId) ?? throw new Exception($"No se encontró el romaneo con ID {romaneoId}");
            romaneo.Estado = 0;
            romaneo.FechaEliminacion = DateTime.Now;
            romaneo.UsuarioEliminacion = usuario;

            var logAbm = new LogABM
            {
                Pantalla = "AnularRomaneo",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Baja,
                Entidad = $"RomaneoPuerto ID: {romaneoId}",
                ClaseId = romaneoId
            };

            _repositorio.Agregar(logAbm);
            _repositorio.GuardarCambios();

            _log.Info($"El usuario {usuario} ha anulado el romaneo con ID {romaneoId} correctamente");
        }
    }
}
