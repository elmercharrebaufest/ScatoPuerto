using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class OtrosMuellesMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "OtrosMuellesMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Muelle, MuelleDto>();
            Mapper.CreateMap<MuelleDto, Muelle>();

            Mapper.CreateMap<OtroMuelleCargaDetalle, OtroMuelleCargaDetalleDto>();
            Mapper.CreateMap<OtroMuelleCargaDetalleDto, OtroMuelleCargaDetalle>()
                .ForMember(dest => dest.OtroMuelleCarga, opt => opt.Ignore());

            Mapper.CreateMap<OtroMuelleCarga, OtroMuelleCargaDto>()
                .ForMember(dest => dest.OtroMuelleCargaDetalles, opt => opt.MapFrom(src => src.OtroMuelleCargaDetalles));
            Mapper.CreateMap<OtroMuelleCargaDto, OtroMuelleCarga>()
                .ForMember(dest => dest.OtroMuelleCargaDetalles, opt => opt.MapFrom(src => src.OtroMuelleCargaDetalles));
        }
    }
}
