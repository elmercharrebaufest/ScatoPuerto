using AutoMapper;
using System;
using System.Collections.Generic;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System.Globalization;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ComprobantePuertoMappingProfile : Profile
    {
        public override string ProfileName
        { get { return "ComprobantePuertoMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<TipoComprobante, TipoComprobanteDto>();

            Mapper.CreateMap<ComprobanteDeEmbarqueDetalle, ComprobanteDeEmbarqueDetalleDto>()
                .ForMember(dest => dest.Cantidad, opt => opt.MapFrom(src => src.Cantidad.ToString("N3", new CultureInfo("es-ES"))))
                .ForMember(dest => dest.NumeroComprobante, opt => opt.MapFrom(src => src.NumeroComprobante.ToString().PadLeft(10, '0')))
                .ForMember(dest => dest.Balanza, opt => opt.MapFrom(src => src.Balanza.ToString()));

            Mapper.CreateMap<ComprobanteDeEmbarque, ComprobanteDeEmbarqueDto>()
                .ForMember(dest => dest.NumeroComprobante, opt => opt.MapFrom(src => src.NumeroComprobante.ToString().PadLeft(2, '0')))
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => MapearEstadoComprobante(src.Estado)));
        }

        private static string MapearEstadoComprobante(int estado)
        {
            switch (estado)
            {
                case 0:
                    return "Anulado";
                case 1:
                    return "Activo";
                default:
                    throw new ArgumentOutOfRangeException("Estado", "Estado de comprobante desconocido");
            }
        }
    }
}
