using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaPlanillaDeTurnosUltimaActualizacionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ModuloDeCargaPlanillaDeTurnosDetallesSolidoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosUltimaActualizacion, ModuloDeCargaPlanillaDeTurnosUltimaActualizacionDto>();
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosUltimaActualizacionDto, ModuloDeCargaPlanillaDeTurnosUltimaActualizacion>();
        }
    }
}