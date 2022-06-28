using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ReciboDeBuqueDetallesMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ReciboDeBuqueDetallesMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ReciboDeBuqueDetalles, ReciboDeBuqueDetallesDto>();
            Mapper.CreateMap<ReciboDeBuqueDetallesDto, ReciboDeBuqueDetalles>();
        }
    }
}