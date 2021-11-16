using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorModificarCalle : ProcesadorModificar<ModificarCalle>
    {
        public ProcesadorModificarCalle(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override void ModificarEntidad(ModificarCalle comando)
        {
            var calle = Repositorio.Obtener<Calle>(comando.Dto.Id);
            Conversor.Convertir(comando.Dto, calle);
        }

        protected override void Validar(ModificarCalle comando, Resultado resultado)
        {

        }
    }
}
