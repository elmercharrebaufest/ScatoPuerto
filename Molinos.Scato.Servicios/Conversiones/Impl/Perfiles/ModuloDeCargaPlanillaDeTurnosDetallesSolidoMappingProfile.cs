using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolidoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ModuloDeCargaPlanillaDeTurnosDetallesSolidoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosDetallesSolido, ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto>();
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto, ModuloDeCargaPlanillaDeTurnosDetallesSolido>();
        }
    }
}