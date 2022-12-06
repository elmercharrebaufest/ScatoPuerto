using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class NominacionDatoTecnicoDestinoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "NominacionDatoTecnicoDestinoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<NominacionDatoTecnicoDestino, NominacionDatoTecnicoDestinoDto>();
            Mapper.CreateMap<NominacionDatoTecnicoDestinoDto, NominacionDatoTecnicoDestino>();
        }
    }
}
