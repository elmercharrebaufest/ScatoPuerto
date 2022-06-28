using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System.Collections.Generic;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorModificarLineUp : ProcesadorModificar<ModificarOrdenLineUp>
    {
        public ProcesadorModificarLineUp(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override void ModificarEntidad(ModificarOrdenLineUp comando)
        {
            foreach (var item in comando.IdsYOrden)
            {
                LineUp lineup = Repositorio.Obtener<LineUp>(x => x.Id == item.Key);
                lineup.Orden = item.Value;
                Repositorio.GuardarCambios();
            }

        }

        protected override void Validar(ModificarOrdenLineUp comando, Resultado resultado)
        {

        }
    }

   
}
