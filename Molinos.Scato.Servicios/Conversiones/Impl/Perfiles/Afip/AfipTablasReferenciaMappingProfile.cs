using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipTablasReferenciaMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipTablasReferenciaMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCondicionContenedor, AfipCondicionContenedorDto>();
            Mapper.CreateMap<AfipCondicionContenedorDto, AfipCondicionContenedor>();

            Mapper.CreateMap<AfipLugarOperativo, AfipLugarOperativoDto>();
            Mapper.CreateMap<AfipLugarOperativoDto, AfipLugarOperativo>();

            Mapper.CreateMap<AfipNaturalezaEmbalaje, AfipNaturalezaEmbalajeDto>();
            Mapper.CreateMap<AfipNaturalezaEmbalajeDto, AfipNaturalezaEmbalaje>();

            Mapper.CreateMap<AfipPais, AfipPaisDto>();
            Mapper.CreateMap<AfipPaisDto, AfipPais>();

            Mapper.CreateMap<AfipPuerto, AfipPuertoDto>();
            Mapper.CreateMap<AfipPuertoDto, AfipPuerto>();

            Mapper.CreateMap<AfipPuntoAduanero, AfipPuntoAduaneroDto>();
            Mapper.CreateMap<AfipPuntoAduaneroDto, AfipPuntoAduanero>();

            Mapper.CreateMap<AfipTipoDocumento, AfipTipoDocumentoDto>();
            Mapper.CreateMap<AfipTipoDocumentoDto, AfipTipoDocumento>();

            Mapper.CreateMap<AfipTipoEmbalaje, AfipTipoEmbalajeDto>();
            Mapper.CreateMap<AfipTipoEmbalajeDto, AfipTipoEmbalaje>();
        }
    }
}
