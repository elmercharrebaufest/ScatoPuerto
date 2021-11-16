using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearAltaCTG : ProcesadorCrear<CrearAltaCTG, AltaCTG>
    {
        public ProcesadorCrearAltaCTG(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override AltaCTG CrearEntidad(CrearAltaCTG comando)
        {
            var dto = Conversor.Convertir<AltaCTGDto, AltaCTG>(comando.Dto);
            var cartaPorte = Repositorio.Obtener<CartaPorte>(comando.Dto.CartaPorteId);
            dto.CartaPorte = cartaPorte;
            cartaPorte.CTG = comando.Dto.CodigoCTG;
            cartaPorte.TarifaReferencia = comando.Dto.TarifaReferencia;
            return dto;
        }

        protected override void Validar(CrearAltaCTG comando, Resultado resultado)
        {
            if (string.IsNullOrEmpty(comando.Dto.CodigoCTG))
            {
                resultado.Error("CodigoCTG", string.Format(Textos.Error_Requerido, "CodigoCTG"));
            }
        }
    }
}
