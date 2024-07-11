using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedadMappingProfile : Profile
    {
        public override string ProfileName => "ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedadMappingProfile";
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad, ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedadDto>();
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedadDto, ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad>();
        }
    }
}
