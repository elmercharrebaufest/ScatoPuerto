using System;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorModificarBodega : ProcesadorModificar<ModificarBodega>
    {
        public ProcesadorModificarBodega(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(ModificarBodega comando)
        {
            var resultado = base.Ejecutar(comando);
            if (!resultado.HayErrores)
            {
                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = comando.ToJson(),
                    ClaseId = comando.Dto.Id
                };
                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            return resultado;
        }

        protected override void ModificarEntidad(ModificarBodega comando)
        {
            var calle = Repositorio.Obtener<Bodega>(comando.Dto.Id);
            Conversor.Convertir(comando.Dto, calle);
        }

        protected override void Validar(ModificarBodega comando, Resultado resultado)
        {

        }
    }
}
