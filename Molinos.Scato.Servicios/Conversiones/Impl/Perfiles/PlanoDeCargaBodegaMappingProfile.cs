using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class PlanoDeCargaBodegaMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "PlanoDeCargaBodegaMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<PlanoDeCargaBodegaDestino, PlanoDeCargaBodegaDestinoDto>();
            Mapper.CreateMap<PlanoDeCargaBodegaDestinoDto, PlanoDeCargaBodegaDestino>();
            Mapper.CreateMap<PlanoDeCargaBodega, PlanoDeCargaBodegaDto>()
                .ForMember(x => x.Destinos, x => x.MapFrom(y => y.PlanoDeCargaBodegaDestino));
            Mapper.CreateMap<PlanoDeCargaBodegaDto, PlanoDeCargaBodega>()
                .ForMember(x => x.PlanoDeCargaBodegaDestino, x => x.MapFrom(y => y.Destinos));
        }
    }
}