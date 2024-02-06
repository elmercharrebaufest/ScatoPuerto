using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Enumeradores;
using System;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCaratulaMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCaratulaMappingProfile"; } }
        protected override void Configure()
        {

            Mapper.CreateMap<AfipSolicitudCambioBuque, AfipSolicitudCambioBuqueDto>()
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => ((EstadosSolicitudesAFIP)src.Estado).ToString()));
            Mapper.CreateMap<AfipSolicitudCambioFechas, AfipSolicitudCambioFechasDto>()
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => ((EstadosSolicitudesAFIP)src.Estado).ToString()))
                .ForMember(dest => dest.MotivoSolicitud, opt => opt.MapFrom(src => src.AfipMotivoSolicitudCambio.Descripcion));
            Mapper.CreateMap<AfipSolicitudCierreCarga, AfipSolicitudCierreCargaDto>()
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => ((EstadosSolicitudesAFIP)src.Estado).ToString()));

            Mapper.CreateMap<AfipCaratula, AfipCaratulaDto>()
                .ForMember(dest => dest.Itinerario, opt => opt.MapFrom(src => src.Itinerario))
                .ForMember(dest => dest.SolicitudesCambioBuque, opt => opt.MapFrom(src => src.SolicitudesCambioBuque))
                .ForMember(dest => dest.SolicitudesCambioFechas, opt => opt.MapFrom(src => src.SolicitudesCambioFechas))
                .ForMember(dest => dest.SolicitudesCierreCarga, opt => opt.MapFrom(src => src.SolicitudesCierreCarga));
            Mapper.CreateMap<AfipCaratulaDto, AfipCaratula>()
                .ForMember(dest => dest.Itinerario, opt => opt.MapFrom(src => src.Itinerario))
                .ForMember(dest => dest.SolicitudesCambioBuque, opt => opt.Ignore())
                .ForMember(dest => dest.SolicitudesCambioFechas, opt => opt.Ignore())
                .ForMember(dest => dest.SolicitudesCierreCarga, opt => opt.Ignore());

            Mapper.CreateMap<AfipCaratulaDto, Caratula>().ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipCaratulaItinerarioDto, Puerto>().ForMember(dest => dest.CodigoPuerto, opt => opt.MapFrom(src => src.Puerto));

        }
    }
}
