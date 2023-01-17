using System.Globalization;
using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class NotificacionProgramaDeEmbarqueMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "NotificacionProgramaDeEmbarqueMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<NotificacionProgramaDeEmbarque, NotificacionProgramaDeEmbarqueDto>();
            Mapper.CreateMap<NotificacionProgramaDeEmbarqueDto, NotificacionProgramaDeEmbarque>();
        }
    }
}
