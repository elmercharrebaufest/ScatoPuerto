using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using NPOI.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using System.Web;

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

        public void CrearDocumento(DocumentoDto documento, string usuario)
        {
            var res = _servicioComandos.Ejecutar(new CrearDocumento { Documento = documento, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void ModificarDocumento(DocumentoDto documento, string usuario)
        {
            // Al modificar, se da de baja el original y se crea uno nuevo. De esta forma no se modifica en aquellos donde ya está asociado.
            var res = _servicioComandos.Ejecutar(new ModificarDocumento { Documento = documento, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void EliminarDocumento(int documentoId, string usuario)
        {
            var res = _servicioComandos.Ejecutar(new EliminarDocumentoPuerto { Id = documentoId, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void GuardarConfiguracionDocumento(int nominacionId, List<ConfiguracionDocumentoDto> configuraciones, string usuario)
        {
            var res = _servicioComandos.Ejecutar(new GuardarConfiguracionDocumento { NominacionId = nominacionId, Configuraciones = configuraciones, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public ListaPaginada<DocumentoDto> ListarDocumentos(string nombre, int pagina = 0, int itemsPorPagina = 0)
        {
            IQueryable<Documento> query = _repositorio.Incluir<Documento>()
                .Where(d => d.Activo && (string.IsNullOrEmpty(nombre) || d.Nombre.Contains(nombre)))
                .OrderBy(d => d.Nombre);
            var itemsTotales = query.Count();
            if (pagina > 0 && itemsPorPagina > 0)
            {
                var saltear = (pagina - 1) * itemsPorPagina;
                query = query.Skip(saltear).Take(itemsPorPagina);
            }
            var documentosDb = query.ToList();
            var documentos = _conversor.ConvertirList<Documento, DocumentoDto>(documentosDb);
            return new ListaPaginada<DocumentoDto>(documentos, pagina, itemsPorPagina, itemsTotales);
        }

        public IList<DocumentoTipoDto> ListarDocumentoTipos()
        {
            return Listar<DocumentoTipo, DocumentoTipoDto>();
        }

        public IList<NominacionDocumentoEstadoDto> ListarNominacionDocumentoEstados()
        {
            return Listar<NominacionDocumentoEstado, NominacionDocumentoEstadoDto>();
        }

        public DocumentoDto ObtenerDocumento(int documentoId)
        {
            return Obtener<Documento, DocumentoDto>(documentoId);
        }

        public IList<DocumentoDto> ListarDocumentosNominacion()
        {
            return Listar<Documento, DocumentoDto>(d => d.Activo && d.DocumentoTipo.Nombre == "A solicitar en la nominación");
        }

        public IList<DocumentoDestinoDto> ListarDocumentosDestino(int idDestino)
        {
            return Listar<DocumentoDestino, DocumentoDestinoDto>(d => idDestino == 0 || d.Destino.Id == idDestino);
        }

        public IList<DocumentoMaterialPuertoDto> ListarDocumentosProducto(int idProducto)
        {
            return Listar<DocumentoMaterialPuerto, DocumentoMaterialPuertoDto>(dm => idProducto == 0 || dm.MaterialPuerto.Id == idProducto);
        }

        public IList<NominacionDocumentoDto> ListarDocumentosPorConfiguracion(int configuracionId)
        {
            return Listar<NominacionDocumento, NominacionDocumentoDto>(nd => nd.ConfiguracionDocumento.Id == configuracionId);
        }

        public NominacionDocumentoDto ObtenerNominacionDocumento(int id)
        {
            return Obtener<NominacionDocumento, NominacionDocumentoDto>(id);
        }

        public ArchivoDto ObtenerArchivo(int id)
        {
            var archivoDb = this._repositorio.Obtener<NominacionDocumentoArchivo>(id) ?? throw new Exception("No se encontró el archivo con el ID especificado");
            return new ArchivoDto(archivoDb.Ubicacion);
        }

        public void EliminarArchivo(int id, string usuario)
        {
            var res = _servicioComandos.Ejecutar(new EliminarDocumentoArchivo { Id = id, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void ActualizarEstado(int nomDocId, int estadoId, string usuario)
        {
            var res = _servicioComandos.Ejecutar(new ActualizarNominacionDocumentoEstado { NomDocId = nomDocId, EstadoId = estadoId, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void CrearComentario(int nomDocId, string texto, string usuario)
        {
            try
            {
                var nomDoc = _repositorio.Obtener<NominacionDocumento>(nomDocId) ?? throw new Exception($"No se ha encontrado el id {nomDocId}");
                var comentario = new NominacionDocumentoComentario
                {
                    Comentario = texto,
                    NominacionDocumento = nomDoc,
                    Fecha = DateTime.Now,
                    Usuario = usuario
                };
                _repositorio.Agregar(comentario);
                _repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                _log.Error("Error al crear comentario de documento {0}", e);
                throw e;
            }
        }
    }
}
