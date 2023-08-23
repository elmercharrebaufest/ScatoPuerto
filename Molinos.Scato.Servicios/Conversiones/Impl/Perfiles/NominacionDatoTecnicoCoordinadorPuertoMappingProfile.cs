using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class NominacionDatoTecnicoCoordinadorPuertoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "NominacionDatoTecnicoCoordinadorPuertoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<NominacionDatoTecnicoCoordinadorPuerto, NominacionDatoTecnicoCoordinadorPuertoDto>();
            Mapper.CreateMap<NominacionDatoTecnicoCoordinadorPuertoDto, NominacionDatoTecnicoCoordinadorPuerto>();
        }
    }
}
