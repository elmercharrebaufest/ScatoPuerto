using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class NominacionDatoTecnicoExportadorMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "NominacionDatoTecnicoExportadorMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<NominacionDatoTecnicoExportador, NominacionDatoTecnicoExportadorDto>();
            Mapper.CreateMap<NominacionDatoTecnicoExportadorDto, NominacionDatoTecnicoExportador>();
        }
    }
}
