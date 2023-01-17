using System.Globalization;
using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class NotificacionExcluidosMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "NotifiacionExcluidosMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<NotificacionExcluidos, NotificacionExcluidosDto>();
            Mapper.CreateMap<NotificacionExcluidosDto, NotificacionExcluidos>();
        }
    }
}
