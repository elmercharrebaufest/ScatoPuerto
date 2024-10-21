using AutoMapper;
using System;
using System.Collections.Generic;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class DocumentoMappingProfile : Profile
    {
        public override string ProfileName { get { return "DocumentoMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<DocumentoTipo, DocumentoTipoDto>();
            Mapper.CreateMap<DocumentoTipoDto, DocumentoTipo>();

            Mapper.CreateMap<Documento, DocumentoDto>();
            Mapper.CreateMap<DocumentoDto, Documento>();

            Mapper.CreateMap<DocumentoDestino, DocumentoDestinoDto>();
            Mapper.CreateMap<DocumentoDestinoDto, DocumentoDestino>();

            Mapper.CreateMap<DocumentoMaterialPuerto, DocumentoMaterialPuertoDto>();
            Mapper.CreateMap<DocumentoMaterialPuertoDto, DocumentoMaterialPuerto>();

            Mapper.CreateMap<NominacionDocumentoArchivo, NominacionDocumentoArchivoDto>();
            Mapper.CreateMap<NominacionDocumentoArchivoDto, NominacionDocumentoArchivo>();

            Mapper.CreateMap<NominacionDocumentoComentario, NominacionDocumentoComentarioDto>();
            Mapper.CreateMap<NominacionDocumentoComentarioDto, NominacionDocumentoComentario>();

            Mapper.CreateMap<NominacionDocumentoEstado, NominacionDocumentoEstadoDto>();
            Mapper.CreateMap<NominacionDocumentoEstadoDto, NominacionDocumentoEstado>();

            Mapper.CreateMap<NominacionDocumento, NominacionDocumentoDto>()
                .ForMember(dest => dest.Archivos, opt => opt.MapFrom(src => src.Archivos))
                .ForMember(dest => dest.Comentarios, opt => opt.MapFrom(src => src.Comentarios))
                .ForMember(dest => dest.NominacionDocumentoEstado, opt => opt.MapFrom(src => src.NominacionDocumentoEstado));
            Mapper.CreateMap<NominacionDocumentoDto, NominacionDocumento>();

            Mapper.CreateMap<ConfiguracionDocumento, ConfiguracionDocumentoDto>()
                .ForMember(dest => dest.NominacionDocumentos, opt => opt.MapFrom(src => src.NominacionDocumentos));
            Mapper.CreateMap<ConfiguracionDocumentoDto, ConfiguracionDocumento>();
        }
    }
}
