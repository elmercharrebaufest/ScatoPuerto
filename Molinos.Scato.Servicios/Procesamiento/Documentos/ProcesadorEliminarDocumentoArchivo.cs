using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEliminarDocumentoArchivo : ProcesadorComando<EliminarDocumentoArchivo>
    {
        public ProcesadorEliminarDocumentoArchivo(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(EliminarDocumentoArchivo comando)
        {
            var resultado = new Resultado();
            try
            {
                var documento = Repositorio.Obtener<NominacionDocumentoArchivo>(comando.Id) ?? throw new Exception("No se ha encontrado el id indicado");
                if (File.Exists(documento.Ubicacion))
                {
                    File.Delete(documento.Ubicacion);
                }

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Baja,
                    Entidad = documento.Ubicacion,
                    ClaseId = documento.NominacionDocumento.Id
                };

                Repositorio.Agregar(logABM);
                Repositorio.Remover(documento);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al eliminar archivo de Documento {0}", e);
            }
            return resultado;
        }
    }
}
