using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AdministracionMappingProfile : Profile
    {
        public override string ProfileName
        { get { return "AdministracionMappingProfile"; } }

        protected override void Configure()
        {
            Mapper.CreateMap<EstadoEmbarque, EstadoEmbarqueDto>();
            Mapper.CreateMap<EstadoEmbarqueDto, EstadoEmbarque>();

            Mapper.CreateMap<AdministracionEmbarque, AdministracionEmbarqueDto>();
            Mapper.CreateMap<AdministracionEmbarqueDto, AdministracionEmbarque>();

            Mapper.CreateMap<AdministracionEmbarqueAgencia, AdministracionEmbarqueAgenciaDto>();
            Mapper.CreateMap<AdministracionEmbarqueAgenciaDto, AdministracionEmbarqueAgencia>();

            Mapper.CreateMap<AdministracionEmbarqueExportador, AdministracionEmbarqueExportadorDto>();
            Mapper.CreateMap<AdministracionEmbarqueExportadorDto, AdministracionEmbarqueExportador>();

            Mapper.CreateMap<NotificacionAdministracion, NotificacionAdministracionDto>();
            Mapper.CreateMap<NotificacionAdministracionDto, NotificacionAdministracion>();
        }
    }
}