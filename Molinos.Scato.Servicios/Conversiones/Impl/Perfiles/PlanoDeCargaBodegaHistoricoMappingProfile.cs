using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class PlanoDeCargaBodegaHistoricoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "PlanoDeCargaBodegaHistoricoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<PlanoDeCargaBodegaDestinoHistorico, PlanoDeCargaBodegaDestinoHistoricoDto>();
            Mapper.CreateMap<PlanoDeCargaBodegaDestinoHistoricoDto, PlanoDeCargaBodegaDestinoHistorico>();
            Mapper.CreateMap<PlanoDeCargaBodegaHistorico, PlanoDeCargaBodegaHistoricoDto>()
                .ForMember(x => x.PlanoDeCargaBodegaDestinoHistorico,
                x => x.MapFrom(y => y.PlanoDeCargaBodegaDestinoHistorico));
            Mapper.CreateMap<PlanoDeCargaBodegaHistoricoDto, PlanoDeCargaBodegaHistorico>();
        }
    }
}
