using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorSubirArchivoDocumento : ProcesadorComando<SubirArchivoDocumento>
    {
        public ProcesadorSubirArchivoDocumento(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(SubirArchivoDocumento comando)
        {
            var resultado = new Resultado();
            try
            {
                var nominacionDocumento = Repositorio.Obtener<NominacionDocumento>(comando.NominacionDocumentoId) ?? throw new Exception("No se ha encontrado el id especificado");
                var path = ConfigurationManager.AppSettings["ArchivosPath"];
                DirectoryInfo di = new DirectoryInfo(path + (path.EndsWith("\\") ? "" : "\\") + "NominacionDocumentos\\" + comando.NominacionDocumentoId);

                if (!di.Exists)
                {
                    di.Create();
                }

                foreach (var archivo in comando.Archivos)
                {
                    if (archivo != null && archivo.Contenido.Length > 0)
                    {
                        string rutaArchivo = this.ObtenerRutaArchivo(di, archivo.Nombre);
                        File.WriteAllBytes(rutaArchivo, archivo.Contenido);

                        var DocumentoArchivo = new NominacionDocumentoArchivo
                        {
                            NominacionDocumento = nominacionDocumento,
                            Nombre = rutaArchivo.Split('\\').Last(),
                            Ubicacion = rutaArchivo,
                            FechaSubida = DateTime.Now,
                            Usuario = comando.Usuario ?? ""
                        };
                        Repositorio.Agregar(DocumentoArchivo);
                        Repositorio.GuardarCambios();
                    }
                }
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al subir archivo de Documento {0}", e);
            }
            return resultado;
        }

        private string ObtenerRutaArchivo(DirectoryInfo di, string nombreArchivo)
        {
            string extension = Path.GetExtension(nombreArchivo);
            string nombreSinExtension = Path.GetFileNameWithoutExtension(nombreArchivo);
            string rutaCompleta = Path.Combine(di.FullName, nombreArchivo);

            int count = 1;

            while (File.Exists(rutaCompleta))
            {
                string nombreArchivo2 = $"{nombreSinExtension} ({count}){extension}";
                rutaCompleta = Path.Combine(di.FullName, nombreArchivo2);
                count++;
            }

            return rutaCompleta;
        }
    }
}
