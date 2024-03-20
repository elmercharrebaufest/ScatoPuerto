using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
	public class HistoricoEmbarqueLineUpMappingProfile : Profile
	{
		public override string ProfileName
		{
			get { return "HistoricoEmbarqueLineUpMappingProfile"; }
		}

		protected override void Configure()
		{
			Mapper.CreateMap<HistoricoEmbarqueLineUp, HistoricoEmbarqueLineUpDto>();
			Mapper.CreateMap<HistoricoEmbarqueLineUpDto, HistoricoEmbarqueLineUp>();
		}
	}
}
