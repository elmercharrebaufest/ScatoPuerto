using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
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
                var nominacion = nominacionDocumento.ConfiguracionDocumento.Nominacion;
                var fecha = nominacion.NominacionDatoTecnico.ETARecalada.Value.ToString("dd-MM-yyyy");
                var nombreBuque = nominacion.NominacionDatoTecnico.VaporInformacion.NombreBuque;
                var nombreDestino = nominacionDocumento.ConfiguracionDocumento.Destino.Nombre;
                var nombreCliente = nominacionDocumento.ConfiguracionDocumento.CoordinadorPuerto.Nombre;
                var material = nominacion.NominacionDatoTecnico.MaterialPuerto.DescripcionCortaIngles ?? nominacion.NominacionDatoTecnico.MaterialPuerto.DescripcionCorta;

                var path = ConfigurationManager.AppSettings["ArchivosPath"];
                if (!path.EndsWith("\\"))
                {
                    path += "\\";
                }

                DirectoryInfo di = new DirectoryInfo($"{path}\\Nominaciones Documentos\\{nombreBuque} {fecha}\\{nombreDestino} + {nombreCliente}\\{material}\\{nominacionDocumento.Documento.Nombre}");

                if (!di.Exists)
                {
                    di.Create();
                }

                foreach (var archivo in comando.Archivos)
                {
                    if (archivo != null && archivo.Contenido.Length > 0)
                    {
                        NominacionDocumentoArchivo documentoArchivo;
                        //string rutaArchivo = this.ObtenerRutaArchivo(di, archivo.Nombre);
                        string rutaArchivo = Path.Combine(di.FullName, archivo.Nombre);


                        if (File.Exists(rutaArchivo))
                        {
                            documentoArchivo = Repositorio.Obtener<NominacionDocumentoArchivo>(da => da.Ubicacion == rutaArchivo);
                            documentoArchivo.FechaSubida = DateTime.Now;
                            documentoArchivo.Usuario = comando.Usuario ?? "";
                            File.Delete(rutaArchivo);
                        }
                        else
                        {
                            documentoArchivo = new NominacionDocumentoArchivo
                            {
                                NominacionDocumento = nominacionDocumento,
                                Nombre = rutaArchivo.Split('\\').Last(),
                                Ubicacion = rutaArchivo,
                                FechaSubida = DateTime.Now,
                                Usuario = comando.Usuario ?? ""
                            };
                            Repositorio.Agregar(documentoArchivo);
                        }

                        File.WriteAllBytes(rutaArchivo, archivo.Contenido);
                        Repositorio.GuardarCambios();
                    }
                }

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Alta,
                    Entidad = di.FullName + "\\" + string.Join(", ", comando.Archivos.Select(a => a.Nombre).ToArray()),
                    ClaseId = comando.NominacionDocumentoId
                };
                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al subir archivo de Documento {0}", e);
            }
            return resultado;
        }

        //Éste método servía para renombrar los archivos en caso de que ya existieran
        //private string ObtenerRutaArchivo(DirectoryInfo di, string nombreArchivo)
        //{
        //    string extension = Path.GetExtension(nombreArchivo);
        //    string nombreSinExtension = Path.GetFileNameWithoutExtension(nombreArchivo);
        //    string rutaCompleta = Path.Combine(di.FullName, nombreArchivo);

        //    int count = 1;

        //    while (File.Exists(rutaCompleta))
        //    {
        //        string nombreArchivo2 = $"{nombreSinExtension} ({count}){extension}";
        //        rutaCompleta = Path.Combine(di.FullName, nombreArchivo2);
        //        count++;
        //    }

        //    return rutaCompleta;
        //}
    }
}
