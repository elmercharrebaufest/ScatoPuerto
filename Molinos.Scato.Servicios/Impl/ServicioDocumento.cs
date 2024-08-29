using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioDocumento : IServicioDocumento
    {
        private readonly IRepositorio _repositorio;
        private readonly IConversor _conversor;
        private readonly ILogger _log;
        private readonly IServicioComandos _servicioComandos;
        private readonly IServicioRepositorio _servicioRepositorio;

        public ServicioDocumento(
            IRepositorio repositorio,
            IConversor conversor,
            ILogger log,
            IServicioComandos comandos,
            IServicioRepositorio servicioRepositorio
        )
        {
            _repositorio = repositorio;
            _conversor = conversor;
            _log = log;
            _servicioComandos = comandos;
            _servicioRepositorio = servicioRepositorio;
        }

        #region Metodos Utiles
        public IList<TDto> Listar<TEntidad, TDto>() where TEntidad : class
        {
            return _conversor.ConvertirList<TEntidad, TDto>(_repositorio.Listar<TEntidad>());
        }
        private IList<TDto> Listar<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
        {
            return _conversor.ConvertirList<TEntidad, TDto>(_repositorio.Listar(expresionFiltro));
        }
        private TDto Obtener<TEntidad, TDto>(int id) where TEntidad : class
        {
            return _conversor.Convertir<TEntidad, TDto>(_repositorio.Obtener<TEntidad>(id));
        }
        private TDto Obtener<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
        {
            return _conversor.Convertir<TEntidad, TDto>(_repositorio.Obtener(expresionFiltro));
        }
        #endregion

        public void CrearDocumento(DocumentoDto documento)
        {
            throw new NotImplementedException();
        }

        public void EliminarDocumento(int documentoId)
        {
            throw new NotImplementedException();
        }

        public ListaPaginada<DocumentoDto> ListarDocumentos(Paginacion paginacion, string filtro = null)
        {
            throw new NotImplementedException();
        }

        public IList<DocumentoTipoDto> ListarDocumentoTipos()
        {
            return Listar<DocumentoTipo, DocumentoTipoDto>();
        }

        public IList<NominacionDocumentoEstadoDto> ListarNominacionDocumentoEstados()
        {
            return Listar<NominacionDocumentoEstado, NominacionDocumentoEstadoDto>();
        }

        public void ModificarDocumento(DocumentoDto documento)
        {
            throw new NotImplementedException();
        }

        public DocumentoDto ObtenerDocumento(int documentoId)
        {
            return Obtener<Documento, DocumentoDto>(documentoId);
        }
    }
}
