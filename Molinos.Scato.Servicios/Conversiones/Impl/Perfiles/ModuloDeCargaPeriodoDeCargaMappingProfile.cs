using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Globalization;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaPeriodoDeCargaMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ModuloDeCargaPeriodoDeCargaMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaPeriodoDeCarga, ModuloDeCargaPeriodoDeCargaDto>();
            Mapper.CreateMap<ModuloDeCargaPeriodoDeCargaDto, ModuloDeCargaPeriodoDeCarga>();

            Mapper.CreateMap<ModuloDeCargaPeriodoDeCarga, ModuloDeCargaPeriodoDeCargaNuevoDto>()
                 .ForMember(dest => dest.FechaHoraAmarro, opt => opt.MapFrom(src => CombinarFechaYHora(src.FechaAmarro, src.HoraAmarro)))
                 .ForMember(dest => dest.FechaHoraDesamarro, opt => opt.MapFrom(src => CombinarFechaYHora(src.FechaDesamarro, src.HoraDesamarro)))
                 .ForMember(dest => dest.FechaHoraHabilitacion, opt => opt.MapFrom(src => CombinarFechaYHora(src.FechaHabilitacion, src.HoraHabilitacion)))
                 .ForMember(dest => dest.FechaHoraConexionMangueras, opt => opt.MapFrom(src => CombinarFechaYHora(src.FechaConexionMangueras, src.HoraConexionMangueras)))
                 .ForMember(dest => dest.FechaHoraDesconexionMangueras, opt => opt.MapFrom(src => CombinarFechaYHora(src.FechaDesconexionMangueras, src.HoraDesconexionMangueras)))
                 .ForMember(dest => dest.FechaHoraComienzoCarga, opt => opt.MapFrom(src => CombinarFechaYHora(src.FechaComienzoCarga, src.HoraComienzoCarga)))
                 .ForMember(dest => dest.FechaHoraFinalizacionCarga, opt => opt.MapFrom(src => CombinarFechaYHora(src.FechaFinalizacionCarga, src.HoraFinalizacionCarga)));
            Mapper.CreateMap<ModuloDeCargaPeriodoDeCargaNuevoDto, ModuloDeCargaPeriodoDeCarga>();
        }

        private static DateTime? CombinarFechaYHora(DateTime? fecha, string hora)
        {
            if (!fecha.HasValue)
            {
                return null;
            }
            if (string.IsNullOrEmpty(hora))
            {
                hora = "00:00";
            }

            try
            {
                return DateTime.ParseExact($"{fecha:yyyy-MM-dd} {hora}", "yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture);
            }
            catch
            {
                return null;
            }
        }
    }
}