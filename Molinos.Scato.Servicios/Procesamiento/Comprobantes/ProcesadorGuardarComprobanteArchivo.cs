using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using NPOI.SS.Formula.Functions;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarComprobanteArchivo : ProcesadorComando<GuardarComprobanteArchivo>
    {
        public ProcesadorGuardarComprobanteArchivo(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(GuardarComprobanteArchivo comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                Log.Info($"El usuario {comando.Usuario} va a imprimir el comprobante con ID {comando.ComprobanteId}");

                var comprobante = Repositorio.Obtener<ComprobanteDeEmbarque>(comando.ComprobanteId) ?? throw new Exception("No se ha encontrado el id especificado");
                var embarque = Repositorio.Obtener<LineUp>(l => l.ModuloDeCarga.Id == comprobante.ModuloDeCarga.Id).Embarque;

                var fechaAnterior = comprobante.FechaImpresion?.ToString("dd/MM/yyyy HH:mm") ?? "Sin Fecha";
                var usuarioAnterior = comprobante.UsuarioEmision ?? "Sin usuario";

                comprobante.FechaImpresion = DateTime.Now;
                comprobante.UsuarioEmision = comando.Usuario;

                if (comando.Npaginas > 0)
                {
                    comprobante.CantidadPaginas = comando.Npaginas;
                }

                var logAbm = new LogABM
                {
                    Pantalla = "GuardarImpresionComprobante",
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = $"{usuarioAnterior} {fechaAnterior} -> {comprobante.UsuarioEmision} {comprobante.FechaImpresion?.ToString("dd/MM/yyyy HH:mm")}",
                    ClaseId = comando.ComprobanteId
                };

                Repositorio.Agregar(logAbm);

                var path = ConfigurationManager.AppSettings["ArchivosPath"];
                if (!path.EndsWith("\\"))
                {
                    path += "\\";
                }

                DirectoryInfo di = new DirectoryInfo($"{path}\\Comprobantes de Embarque");

                if (!di.Exists)
                {
                    di.Create();
                }

                var nombreArchivo = $"{comprobante.Id} {embarque.Vapor.Nombre} {comprobante.TipoComprobante.Descripcion}-{comprobante.NumeroComprobante}.pdf";
                string rutaArchivo = Path.Combine(di.FullName, nombreArchivo);

                Log.Info($"Guardando el archivo del comprobante en la ruta: {rutaArchivo}");

                if (File.Exists(rutaArchivo))
                {
                    Log.Info("El archivo ya existe, se procede a eliminarlo antes de guardar el nuevo");
                    File.Delete(rutaArchivo);
                }

                File.WriteAllBytes(rutaArchivo, comando.Archivo.Contenido);
                Log.Info("Archivo guardado correctamente");

                comprobante.UbicacionArchivo = rutaArchivo;
                Repositorio.GuardarCambios();

                resultado.Mensaje = rutaArchivo;
                Log.Info($"El usuario {comando.Usuario} ha guardado la impresión del comprobante con ID {comando.ComprobanteId} correctamente");
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al guardar el archivo del comprobante", e);
            }
            return resultado;
        }
    }
}
