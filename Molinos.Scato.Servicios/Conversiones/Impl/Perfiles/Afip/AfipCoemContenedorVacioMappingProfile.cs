using AutoMapper;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCoemContenedorVacioMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCoemContenedorVacioMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoemContenedorVacio, AfipCoemContenedorVacioDto>();
            Mapper.CreateMap<AfipCoemContenedorVacioDto, AfipCoemContenedorVacio>();
        }
    }
}
