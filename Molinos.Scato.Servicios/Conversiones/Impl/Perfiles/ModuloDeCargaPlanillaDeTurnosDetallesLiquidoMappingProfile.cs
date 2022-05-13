using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesLiquidoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ModuloDeCargaPlanillaDeTurnosDetallesLiquidoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosDetallesLiquido, ModuloDeCargaPlanillaDeTurnosDetallesLiquidoDto>();
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosDetallesLiquidoDto, ModuloDeCargaPlanillaDeTurnosDetallesLiquido>();
        }
    }
}