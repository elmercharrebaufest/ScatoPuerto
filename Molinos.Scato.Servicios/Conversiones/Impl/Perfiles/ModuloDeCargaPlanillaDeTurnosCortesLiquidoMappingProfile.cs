using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaPlanillaDeTurnosCortesLiquidoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ModuloDeCargaPlanillaDeTurnosCortesLiquidoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosCortesLiquido, ModuloDeCargaPlanillaDeTurnosCortesLiquidoDto>();
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosCortesLiquidoDto, ModuloDeCargaPlanillaDeTurnosCortesLiquido>();
        }
    }
}