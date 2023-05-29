using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    internal class AfipCoemEstadoMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCoemEstadoMappingProfile"; } }

        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoemEstado, AfipCoemEstadoDto>();
            Mapper.CreateMap<AfipCoemEstadoDto, AfipCoemEstado>();
        }
    }
}
