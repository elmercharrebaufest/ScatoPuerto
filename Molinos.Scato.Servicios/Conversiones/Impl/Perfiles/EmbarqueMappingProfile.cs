using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class EmbarqueMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "EmbarqueMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Embarque, EmbarqueDto>().ForMember(x => x.InstanciaWorkflow,
                x => x.MapFrom(y => y.Recorrido.InstanciaWorkflow))
                .ForMember(x => x.NombreBuque,
                x => x.MapFrom(y => y.Vapor.Nombre))
                .ForMember(x => x.MaterialesPuertoCantidad,
                x => x.MapFrom(y => y.MaterialPuertoCantidad))
                .ForMember(x => x.Coordinadores,
                x => x.MapFrom(y => y.Coordinadores));

            Mapper.CreateMap<EmbarqueDto, Embarque>();

            Mapper.CreateMap<EmbarqueCoordinador, EmbarqueCoordinadorDto>()
                .ForMember(x => x.CoordinadorPuerto, x => x.MapFrom(y => y.CoordinadorPuerto))
                .ForMember(x => x.Id, x => x.MapFrom(y => y.Id));
            Mapper.CreateMap<EmbarqueCoordinadorDto, EmbarqueCoordinador>();

			Mapper.CreateMap<AdministracionEmbarque, AdministracionEmbarqueDto>()
				.ForMember(x => x.EmbarqueId, opt => opt.MapFrom(src => src.Embarque != null ? src.Embarque.Id : 0));
			Mapper.CreateMap<AdministracionEmbarqueDto, AdministracionEmbarque>()
				.ForMember(x => x.Embarque, opt => opt.Ignore());
		}
    }
}
