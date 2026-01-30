using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System.Linq;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
	public class AcuerdosMappingProfile : Profile
	{
		public override string ProfileName { get { return "AcuerdosMappingProfile"; } }
		protected override void Configure()
		{
			Mapper.CreateMap<AcuerdoTipo, AcuerdoTipoDto>();
			Mapper.CreateMap<AcuerdoTipoDto, AcuerdoTipo>();

			Mapper.CreateMap<AcuerdoTipoConfiguracionConcepto, AcuerdoTipoConfiguracionConceptoDto>();
			Mapper.CreateMap<AcuerdoTipoConfiguracionConceptoDto, AcuerdoTipoConfiguracionConcepto>();

			Mapper.CreateMap<AcuerdoTipoConfiguracion, AcuerdoTipoConfiguracionDto>()
				.ForMember(dest => dest.AcuerdoTipoConfiguracionConceptos, opt => opt.MapFrom(src => src.AcuerdoTipoConfiguracionConceptos
					.OrderBy(c => c.Concepto.Orden.HasValue ? 0 : 1) // primero los que tienen orden
					.ThenBy(c => c.Concepto.Orden)
				));
			Mapper.CreateMap<AcuerdoTipoConfiguracionDto, AcuerdoTipoConfiguracion>();

			Mapper.CreateMap<AcuerdoDetalleConcepto, AcuerdoDetalleConceptoDto>();
			Mapper.CreateMap<AcuerdoDetalleConceptoDto, AcuerdoDetalleConcepto>();

			Mapper.CreateMap<AcuerdoDetalle, AcuerdoDetalleDto>();
			Mapper.CreateMap<AcuerdoDetalleDto, AcuerdoDetalle>();

			Mapper.CreateMap<AcuerdoEmbarque, AcuerdoEmbarqueDto>();
			Mapper.CreateMap<AcuerdoEmbarqueDto, AcuerdoEmbarque>();

			Mapper.CreateMap<Acuerdo, AcuerdoDto>()
				.ForMember(dest => dest.Estado, opt => opt.MapFrom(src => CalcularEstadoAcuerdo(src)))
				.AfterMap((src, dest) => CompletarRelacionEmbarques(src, dest));
			Mapper.CreateMap<AcuerdoDto, Acuerdo>();
		}

		private string CalcularEstadoAcuerdo(Acuerdo acuerdo)
		{
			if (acuerdo.FechaEliminacion != null)
			{
				return "anulado";
			}

			var tieneEmbarques = acuerdo.AcuerdoDetalles.Any(d => d.AcuerdoEmbarques != null && d.AcuerdoEmbarques.Any());

			if (!tieneEmbarques)
			{
				return "nuevo";
			}

			// Verificar que todos los detalles estén completos
			foreach (var detalle in acuerdo.AcuerdoDetalles)
			{
				var totalEmbarcado = detalle.AcuerdoEmbarques?.Sum(e => e.Cantidad) ?? 0m;

				if (totalEmbarcado < detalle.CantidadTotal)
				{
					return "pendiente";
				}
			}

			return "completo";
		}

		private void CompletarRelacionEmbarques(Acuerdo src, AcuerdoDto dest)
		{
			foreach (var detalle in dest.AcuerdoDetalles)
			{
                var detalleSrc = src.AcuerdoDetalles.FirstOrDefault(d => d.MaterialPuerto.Id == detalle.MaterialPuerto.Id);

				if (detalleSrc?.AcuerdoEmbarques == null || !detalleSrc.AcuerdoEmbarques.Any())
				{
					detalle.RelacionEmbarque = false;
					detalle.Buques = "-";
					continue;
				}

				var buques = detalleSrc.AcuerdoEmbarques.Select(e => e.Embarque.Vapor.Nombre).Distinct().ToList();

				detalle.RelacionEmbarque = true;
				detalle.Buques = string.Join(", ", buques);
			}
		}
	}
}