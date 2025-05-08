using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Entidades.Administracion;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AdministracionMappingProfile : Profile
    {
        public override string ProfileName
        { get { return "AdministracionMappingProfile"; } }

        protected override void Configure()
        {
            Mapper.CreateMap<EstadoEmbarque, EstadoEmbarqueDto>();
            Mapper.CreateMap<EstadoEmbarqueDto, EstadoEmbarque>();

            Mapper.CreateMap<AdministracionEmbarque, AdministracionEmbarqueDto>();
            Mapper.CreateMap<AdministracionEmbarqueDto, AdministracionEmbarque>();

            Mapper.CreateMap<AdministracionEmbarqueAgencia, AdministracionEmbarqueAgenciaDto>();
            Mapper.CreateMap<AdministracionEmbarqueAgenciaDto, AdministracionEmbarqueAgencia>();

            Mapper.CreateMap<AdministracionEmbarqueExportador, AdministracionEmbarqueExportadorDto>();
            Mapper.CreateMap<AdministracionEmbarqueExportadorDto, AdministracionEmbarqueExportador>();

            Mapper.CreateMap<NotificacionAdministracion, NotificacionAdministracionDto>();
            Mapper.CreateMap<NotificacionAdministracionDto, NotificacionAdministracion>();

            Mapper.CreateMap<Moneda, MonedaDto>();
            Mapper.CreateMap<MonedaDto, Moneda>();

            Mapper.CreateMap<TipoTarifa, TipoTarifaDto>();
            Mapper.CreateMap<TipoTarifaDto, TipoTarifa>();

            Mapper.CreateMap<TipoConcepto, TipoConceptoDto>();
            Mapper.CreateMap<TipoConceptoDto, TipoConcepto>();

            Mapper.CreateMap<Concepto, ConceptoDto>();
            Mapper.CreateMap<ConceptoDto, Concepto>();

            Mapper.CreateMap<TarifaPorEmbarqueConcepto, TarifaPorEmbarqueConceptoDto>();
            Mapper.CreateMap<TarifaPorEmbarqueConceptoDto, TarifaPorEmbarqueConcepto>();

            Mapper.CreateMap<TarifaPorProductoConcepto, TarifaPorProductoConceptoDto>();
            Mapper.CreateMap<TarifaPorProductoConceptoDto, TarifaPorProductoConcepto>();

            Mapper.CreateMap<TarifaPorProducto, TarifaPorProductoDto>();
            Mapper.CreateMap<TarifaPorProductoDto, TarifaPorProducto>();

            Mapper.CreateMap<TarifaPorEmbarque, TarifaPorEmbarqueDto>();
            Mapper.CreateMap<TarifaPorEmbarqueDto, TarifaPorEmbarque>();
        }
    }
}