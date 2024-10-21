using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEliminarDocumentoPuerto : ProcesadorComando<EliminarDocumentoPuerto>
    {
        public ProcesadorEliminarDocumentoPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(EliminarDocumentoPuerto comando)
        {
            var resultado = new Resultado();
            try
            {
                var documento = Repositorio.Obtener<Documento>(comando.Id) ?? throw new Exception("No existe el documento con el id especificado");

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = Conversor.Convertir<Documento, DocumentoDto>(documento).ToJson(),
                    ClaseId = comando.Id
                };
                Repositorio.Agregar(logABM);

                documento.Activo = false;
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al Modificar Documento {0}", e);
            }
            return resultado;
        }
    }
}
