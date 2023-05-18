using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    internal class AfipCaratulaEstadoMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCaratulaEstadoMappingProfile"; } }

        protected override void Configure()
        {
            Mapper.CreateMap<AfipCaratulaEstado, AfipCaratulaEstadoDto>();
            Mapper.CreateMap<AfipCaratulaEstadoDto, AfipCaratulaEstado>();
        }

    }
}
