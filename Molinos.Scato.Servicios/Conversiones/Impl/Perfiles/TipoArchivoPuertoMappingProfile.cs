using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class TipoArchivoPuertoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ArchivosPuertoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<TipoArchivoPuerto, TipoArchivoPuertoDto>();
            Mapper.CreateMap<TipoArchivoPuertoDto, TipoArchivoPuerto>();
        }
    }
}