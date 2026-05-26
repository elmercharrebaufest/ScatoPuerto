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
			Mapper.CreateMap<HistoricoEmbarqueLineUp, HistoricoEmbarqueLineUpDto>()
				.ForMember(dest => dest.EnSap, opt => opt.MapFrom(src =>
					src.TransaccionSAP != null && src.TransaccionSAP.Estado == "Enviado" ? "SI" : "NO"))
				.ForMember(dest => dest.MensajeErrorSap, opt => opt.MapFrom(src =>
					src.TransaccionSAP != null && src.TransaccionSAP.Estado == "Error" ? src.TransaccionSAP.MensajeSAP : null))
				.ForMember(dest => dest.TieneCambiosPendientes, opt => opt.MapFrom(src =>
					src.TransaccionSAP == null || src.TransaccionSAP.Estado == "Error" || src.TransaccionSAP.Estado == "Pendiente"));

			Mapper.CreateMap<HistoricoEmbarqueLineUpDto, HistoricoEmbarqueLineUp>()
				.ForMember(dest => dest.TransaccionSAP, opt => opt.Ignore());
		}
	}
}