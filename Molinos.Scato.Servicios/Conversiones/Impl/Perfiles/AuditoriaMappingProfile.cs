using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AuditoriaMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "AuditoriaMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Auditoria, AuditoriaDto>();
            Mapper.CreateMap<AuditoriaDto, Auditoria>();
        }
    }
}
