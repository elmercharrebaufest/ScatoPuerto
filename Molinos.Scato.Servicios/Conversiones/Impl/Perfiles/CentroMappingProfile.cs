using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class CentroMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "CentroMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Centro, CentroDto>()
                .ForMember(x => x.CamaraId, c => c.MapFrom(centro => centro.CamaraDefault != null ? centro.CamaraDefault.Id : 0))
                .ForMember(x => x.CamaraDesc, c => c.MapFrom(centro => centro.CamaraDefault != null ? centro.CamaraDefault.Descripcion : null))
                .ForMember(x => x.CamaraCodigoSap, c => c.MapFrom(centro => centro.CamaraDefault != null ? centro.CamaraDefault.CodigoSAP : null))
                .ForMember(x => x.ProvinciaId, c => c.MapFrom(centro => centro.Provincia != null ? (int?)centro.Provincia.Id : null))
                .ForMember(x => x.ProvinciaDesc, c => c.MapFrom(centro => centro.Provincia != null ? centro.Provincia.Descripcion : null))
                .ForMember(x => x.LocalidadId, c => c.MapFrom(centro => centro.Localidad != null ? (int?)centro.Localidad.Id : null))
                .ForMember(x => x.LocalidadCodigoSap, c => c.MapFrom(centro => centro.Localidad != null ? centro.Localidad.CodigoAfip : null))
                .ForMember(x => x.LocalidadDesc, c => c.MapFrom(centro => centro.Localidad != null ? centro.Localidad.Descripcion : null));
            Mapper.CreateMap<CentroDto, Centro>();
        }
    }
}
