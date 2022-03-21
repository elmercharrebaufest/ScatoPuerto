using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class EmbarquePosicionHistoricoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "EmbarquePosicionHistoricoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<EmbarquePosicionHistorico, EmbarquePosicionHistoricoDto>();
            Mapper.CreateMap<EmbarquePosicionHistoricoDto, EmbarquePosicionHistorico>();
        }
    }
}