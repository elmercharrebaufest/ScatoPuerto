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
            Mapper.CreateMap<RomaneoPuertoComprobante, RomaneoPuertoComprobanteDto>()
                .ForMember(dest => dest.Cantidad, opt => opt.MapFrom(src => src.Cantidad.ToString("N3", new CultureInfo("es-ES"))))
                .ForMember(dest => dest.NumeroComprobante, opt => opt.MapFrom(src => src.NumeroComprobante.ToString().PadLeft(10, '0')))
                .ForMember(dest => dest.Balanza, opt => opt.MapFrom(src => "BAL" + src.Balanza.ToString()));

            Mapper.CreateMap<RomaneoPuerto, ComprobantePuertoDto>()
                .ForMember(dest => dest.TipoComprobante, opt => opt.MapFrom(src => "ROMANEO"))
                .ForMember(dest => dest.Numero, opt => opt.MapFrom(src => src.NumeroRomaneo))
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => MapearEstadoComprobante(src.Estado)))
                .ForMember(dest => dest.SecuenciasReales, opt => opt.Ignore());
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
