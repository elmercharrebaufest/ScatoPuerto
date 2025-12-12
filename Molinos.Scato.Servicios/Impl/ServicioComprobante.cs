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

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioComprobante : IServicioComprobante
    {
        private readonly IRepositorio _repositorio;
        private readonly IConversor _conversor;
        private readonly ILogger _log;
        private readonly IServicioComandos _servicioComandos;

        public ServicioComprobante(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioComandos comandos)
        {
            _repositorio = repositorio;
            _conversor = conversor;
            _log = log;
            _servicioComandos = comandos;
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

        public ComprobanteDeEmbarqueDto GenerarRomaneo(int moduloDeCargaId, string usuario)
        {
            _log.Info($"El usuario ${usuario} va a generar un romaneo para el módulo de carga con ID {moduloDeCargaId}");
            var res = (ResultadoCrear)_servicioComandos.Ejecutar(new GenerarRomaneoPuerto { ModuloDeCargaId = moduloDeCargaId, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            _log.Info($"El usuario ${usuario} ha generado el romaneo correctamente");
            return ObtenerComprobante(res.Id);
        }

        public ComprobanteDeEmbarqueDto GenerarSecuenciaRealCarga(int moduloDeCargaId, string usuario)
        {
            _log.Info($"El usuario ${usuario} va a generar una secuencia real de carga para el módulo de carga con ID {moduloDeCargaId}");
            var res = (ResultadoCrear)_servicioComandos.Ejecutar(new GenerarSecuenciaRealCarga { ModuloDeCargaId = moduloDeCargaId, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            _log.Info($"El usuario ${usuario} ha generado la secuencia real de carga correctamente");
            return ObtenerComprobante(res.Id);
        }

        public ComprobanteDeEmbarqueDto ObtenerComprobante(int comprobanteId)
        {
            var comprobante = _repositorio.Obtener<ComprobanteDeEmbarque>(comprobanteId) ?? throw new Exception($"No se encontró el comprobante con ID {comprobanteId}");
            return _conversor.Convertir<ComprobanteDeEmbarque, ComprobanteDeEmbarqueDto>(comprobante);
        }

        public List<ComprobanteDeEmbarqueDto> ListarComprobantes(int moduloDeCargaId)
        {
            var comprobantes = _repositorio.Listar<ComprobanteDeEmbarque>(r => r.ModuloDeCarga.Id == moduloDeCargaId).ToList();
            return _conversor.Convertir<List<ComprobanteDeEmbarque>, List<ComprobanteDeEmbarqueDto>>(comprobantes);
        }

        public void GuardarFechaImpresionComprobante(int comprobanteId, string usuario)
        {
            _log.Info($"El usuario {usuario} va a imprimir el comprobante con ID {comprobanteId}");
            var comprobante = _repositorio.Obtener<ComprobanteDeEmbarque>(comprobanteId) ?? throw new Exception($"No se encontró el romaneo con ID {comprobanteId}");
            var fechaAnterior = comprobante.FechaImpresion?.ToString("dd/MM/yyyy HH:mm") ?? "Sin Fecha";
            var usuarioAnterior = comprobante.UsuarioEmision ?? "Sin usuario";
            comprobante.FechaImpresion = DateTime.Now;
            comprobante.UsuarioEmision = usuario;

            var logAbm = new LogABM
            {
                Pantalla = "GuardarImpresionComprobante",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = $"{usuarioAnterior} {fechaAnterior} -> {comprobante.UsuarioEmision} {comprobante.FechaImpresion?.ToString("dd/MM/yyyy HH:mm")}",
                ClaseId = comprobanteId
            };

            _repositorio.Agregar(logAbm);
            _repositorio.GuardarCambios();

            _log.Info($"El usuario {usuario} ha guardado la impresión del comprobante con ID {comprobanteId} correctamente");
        }

        public void AnularComprobante(int comprobanteId, string usuario)
        {
            _log.Info($"El usuario {usuario} va a anular el comprobante con ID {comprobanteId}");
            var comprobante = _repositorio.Obtener<ComprobanteDeEmbarque>(comprobanteId) ?? throw new Exception($"No se encontró el romaneo con ID {comprobanteId}");
            comprobante.Estado = 0;
            comprobante.FechaEliminacion = DateTime.Now;
            comprobante.UsuarioEliminacion = usuario;

            var logAbm = new LogABM
            {
                Pantalla = "AnularComprobante",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Baja,
                Entidad = $"ComprobanteDeEmbarque ID: {comprobanteId}",
                ClaseId = comprobanteId
            };

            _repositorio.Agregar(logAbm);
            _repositorio.GuardarCambios();

            _log.Info($"El usuario {usuario} ha anulado el comprobante con ID {comprobanteId} correctamente");
        }

        public ArchivoDto ObtenerArchivoComprobante(int comprobanteId)
        {
            var comprobante = _repositorio.Obtener<ComprobanteDeEmbarque>(comprobanteId) ?? throw new Exception($"No se encontró el comprobante con ID {comprobanteId}");
            if (string.IsNullOrEmpty(comprobante.UbicacionArchivo))
            {
                throw new Exception("No se encontró el archivo del comprobante especificado");
            }
            return new ArchivoDto(comprobante.UbicacionArchivo);
        }

        public string ObtenerNombreArchivo(int comprobanteId)
        {
            var comprobante = _repositorio.Obtener<ComprobanteDeEmbarque>(comprobanteId) ?? throw new Exception("No se ha encontrado el id especificado");
            var embarque = _repositorio.Obtener<LineUp>(l => l.ModuloDeCarga.Id == comprobante.ModuloDeCarga.Id).Embarque;
            return $"{comprobante.Id} {embarque.Vapor.Nombre} {comprobante.TipoComprobante.Descripcion}-{comprobante.NumeroComprobante}.pdf";
        }
    }
}
