using System;
using Molinos.Scato.Dominio;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEliminarBodega : ProcesadorComando<EliminarBodega>
    {
        public ProcesadorEliminarBodega(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(EliminarBodega comando)
        {
            var resultado = new Resultado();
            try
            {
                Repositorio.Remover<Bodega>(comando.Id);
                Repositorio.GuardarCambios();

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Baja,
                    Entidad = comando.ToJson(),
                    ClaseId = comando.Id
                };
                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            catch (EntidadReferenciadaException)
            {
                resultado.Error("", Textos.Error_EliminarReferenciado);
            }
            catch (Exception e)
            {
                Log.Error(e, "Ocurrio al eliminar la entidad del tipo {0} - Id {1}", typeof(Bodega).Name, comando.Id);
                resultado.Error("", Textos.Error_ActualizarGenerico);
            }
            return resultado;
        }
    }
}
