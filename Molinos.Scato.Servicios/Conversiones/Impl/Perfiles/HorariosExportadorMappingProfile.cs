using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class HorariosExportadorMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "HorariosExportadorMappingProfile"; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<HorariosExportador, HorariosExportadorDto>();
            Mapper.CreateMap<HorariosExportadorDto, HorariosExportador>();
        }
    }
}