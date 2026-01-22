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

            if (acuerdo.AcuerdoEmbarques == null || !acuerdo.AcuerdoEmbarques.Any())
            {
                return "nuevo";
            }

            var embarcadoPorMaterial = acuerdo.AcuerdoEmbarques
                .GroupBy(e => e.MaterialPuerto.Id)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Cantidad));

            foreach (var detalle in acuerdo.AcuerdoDetalles)
            {
                var materialId = detalle.MaterialPuerto.Id;
                var cantidadEmbarcada = embarcadoPorMaterial.ContainsKey(materialId) ? embarcadoPorMaterial[materialId] : 0m;

                if (cantidadEmbarcada < detalle.Cantidad)
                {
                    return "pendiente";
                }
            }

            return "completo";
        }

        private void CompletarRelacionEmbarques(Acuerdo src, AcuerdoDto dest)
        {
            if (src.AcuerdoEmbarques == null || !src.AcuerdoEmbarques.Any())
            {
                return;
            }

            var embarquesPorMaterial = src.AcuerdoEmbarques
                .GroupBy(ae => ae.MaterialPuerto.Id)
                .ToDictionary(g => g.Key, g => g.Select(ae => ae.Embarque.Vapor.Nombre).Distinct().ToList());

            foreach (var detalle in dest.AcuerdoDetalles)
            {
                if (embarquesPorMaterial.TryGetValue(detalle.MaterialPuerto.Id, out var buques))
                {
                    detalle.RelacionEmbarque = true;
                    detalle.Buques = string.Join(", ", buques);
                }
                else
                {
                    detalle.RelacionEmbarque = false;
                    detalle.Buques = "-";
                }
            }
        }

    }
}
