using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Documentos;
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

namespace Molinos.Scato.Servicios.Procesamiento.Documentos
{
    public class ProcesadorCerrarNominacionesDocumentos : ProcesadorComando<CerrarNominacionesDocumentos>
    {
        public ProcesadorCerrarNominacionesDocumentos(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(CerrarNominacionesDocumentos comando)
        {
            var resultado = new Resultado();
            try
            {
                var estado = Repositorio.Obtener<NominacionDocumentoEstado>(e => e.Estado == "Documento Cerrado") ?? throw new Exception("No se ha encontrado el estado con el id especificado");

                foreach (int id in comando.NomDocIds){
                    var nominacionDocumento = Repositorio.Obtener<NominacionDocumento>(id) ?? throw new Exception("No se ha encontrado la nominacion con el id especificado");
                    var logABM = new LogABM
                    {
                        Pantalla = comando.GetType().Name,
                        Usuario = comando.Usuario,
                        Fecha = DateTime.Now,
                        Evento = EventoABM.Modificacion,
                        Entidad = nominacionDocumento.NominacionDocumentoEstado.Estado + " -> " + estado.Estado,
                        ClaseId = id
                    };
                    Repositorio.Agregar(logABM);
                    nominacionDocumento.NominacionDocumentoEstado = estado;
                }
                
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al intentar cerrar documentos: " + string.Join(", ", comando.NomDocIds), e);
            }
            return resultado;
        }
    }
}
