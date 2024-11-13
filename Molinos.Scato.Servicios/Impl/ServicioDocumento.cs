using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Documentos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Documentos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.GestionarCartasDePortePE;
using Ninject.Extensions.Logging;
using NPOI.Util;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
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

        public ListaPaginada<DocumentoDto> ListarDocumentos(string nombre, int pagina = 0, int itemsPorPagina = 0, List<string> listTipoDeProducto = null, List<string> listDocumentoTipo = null)
        {
            bool esSolido = false;
            bool esLiquido = false;

            var query = _repositorio.Listar<Documento>()
                .Where(d => d.Activo && (string.IsNullOrEmpty(nombre) || d.Nombre.Contains(nombre)));
                //.OrderBy(d => d.Nombre);

            if (listDocumentoTipo.Count > 0)
            {
                query = query.Where(x => listDocumentoTipo.Any(y => y.Contains(Convert.ToString(x.DocumentoTipo.Id)))).ToList();
            }

            if (listTipoDeProducto.Count > 0)
            {
                var listarDocumentoMaterialPuerto = _repositorio.Listar<DocumentoMaterialPuerto>();
                if (listTipoDeProducto.Count !=2)
                {
                    foreach (var tipoProducto in listTipoDeProducto)
                    {
                        if (tipoProducto.Equals("1")) esLiquido = true;
                        if (tipoProducto.Equals("2")) esSolido = true;
                    }

                    if (esLiquido)
                        listarDocumentoMaterialPuerto = listarDocumentoMaterialPuerto.Where(x => x.MaterialPuerto.EsLiquido == esLiquido).ToList();

                    if (esSolido)
                        listarDocumentoMaterialPuerto = listarDocumentoMaterialPuerto.Where(x => x.MaterialPuerto.EsLiquido == !esSolido).ToList();

                    query = query.Where(x => listarDocumentoMaterialPuerto.Any(y => y.Documento.Id.ToString().Contains(Convert.ToString(x.Id)))).ToList();
                }
            }

            query = query.OrderBy(d => d.Nombre).ToList();

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
        public NominacionDocumentoEmbarqueDto ObtenerNominacionDocumentoEmbarque(int nominacionId)
        {
            var nominacion = this._repositorio.Obtener<Nominacion>(x => x.Id == nominacionId);
            var lineUp = nominacion.Embarque!=null? this._repositorio.Obtener<LineUp>(x => x.Embarque.Id == nominacion.Embarque.Id) : null;
            var nominacionDocumentoEmbarque = new NominacionDocumentoEmbarqueDto();
            nominacionDocumentoEmbarque.NombreBuque = nominacion.NominacionDatoTecnico.VaporInformacion.Vapor.Nombre;
            nominacionDocumentoEmbarque.FechaNominacion = nominacion.FechaCreacion.Value.ToString("dd/MM/yyyy hh:mm");
            if (lineUp != null && lineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga != null && lineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.Count > 0)
            {
                var moduloDeCargaPeriodoDeCarga = lineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga?.FirstOrDefault();
                if (moduloDeCargaPeriodoDeCarga != null && moduloDeCargaPeriodoDeCarga.FechaFinalizacionCarga != null && moduloDeCargaPeriodoDeCarga.HoraFinalizacionCarga != null)
                {
                    string fechaFinCarga = moduloDeCargaPeriodoDeCarga.FechaFinalizacionCarga.Value.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
                    string horaFinCarga = moduloDeCargaPeriodoDeCarga.HoraFinalizacionCarga != null ? moduloDeCargaPeriodoDeCarga.HoraFinalizacionCarga : string.Empty;
                    nominacionDocumentoEmbarque.FechaFinalizacionCarga = string.Format("{0} {1}", fechaFinCarga, horaFinCarga);
                }
            }
            return nominacionDocumentoEmbarque;
        }

        public IList<NominacionDocumentoEstadoPorEmbarqueDto> ListarNominacionDocumentoEstadoPorEmbarque(int nominacionId, int configuracionDocumentoId, List<string> documento = null, List<string> documentoEstado = null)
        {
            var listarNominacionDocumentoEstadoPorEmbarque = new List<NominacionDocumentoEstadoPorEmbarqueDto>();

            List<string> listaDocumentos = documento != null ? documento : new List<string>();
            List<string> listaDocumentoEstados = documentoEstado != null ? documentoEstado : new List<string>();

            var nominacion = this._repositorio.Obtener<Nominacion>(x => x.Id == nominacionId);
            if (nominacion.ConfiguracionDocumentos.Count > 0)
            {
                var configuracionPorNominacion = nominacion.ConfiguracionDocumentos?
                                                .Where(x => x.Id == configuracionDocumentoId)
                                                .SelectMany(t => t.NominacionDocumentos).ToList();
                configuracionPorNominacion = configuracionPorNominacion
                                            .Where(x =>
                                                      (!string.IsNullOrEmpty(x.Documento.Id.ToString()) &&
                                                        (!listaDocumentos.Any() || listaDocumentos.Any(y => y.Contains(x.Documento.Id.ToString())

                                                      ))) &&
                                                      (!string.IsNullOrEmpty(x.NominacionDocumentoEstado.Id.ToString()) &&
                                                        (!listaDocumentoEstados.Any() || listaDocumentoEstados.Any(y => y.Contains(x.NominacionDocumentoEstado.Id.ToString())))
                                                      )
                                                  ).ToList();

                foreach (var documentoNominacion in configuracionPorNominacion)
                {
                    var documentoEstadoPorEmbarque = new NominacionDocumentoEstadoPorEmbarqueDto()
                    {
                        DocumentoId = documentoNominacion.Id,
                        Documento = documentoNominacion.Documento.Nombre,
                        EsBorradorAprobado = documentoNominacion.NominacionDocumentoEstado.Estado == "Borrador Aprobado" ? true : false,
                        EsBorradorEnviado = documentoNominacion.NominacionDocumentoEstado.Estado == "Borrador Enviado" ? true : false,
                        EsBorradorModificado = documentoNominacion.NominacionDocumentoEstado.Estado == "Borrador Modificado" ? true : false,
                        EsBorradorSolicitado = documentoNominacion.NominacionDocumentoEstado.Estado == "Borrador Solicitado" ? true : false,
                        EsDocumentoEnviado = documentoNominacion.NominacionDocumentoEstado.Estado == "Documento Enviado" ? true : false,
                        EsDocumentoCerrado = documentoNominacion.NominacionDocumentoEstado.Estado == "Documento Cerrado" ? true : false,
                    };
                    listarNominacionDocumentoEstadoPorEmbarque.Add(documentoEstadoPorEmbarque);
                }
            }
            return listarNominacionDocumentoEstadoPorEmbarque;
        }

        public IList<DocumentoDto> ListarDocumentosPorNominacion(int nominacionId)
        {
            IList<DocumentoDto> resultado = new List<DocumentoDto>();
            var nominacion = this._repositorio.Obtener<Nominacion>(x => x.Id == nominacionId);
            foreach (var configuracion in nominacion.ConfiguracionDocumentos)
            {
                foreach (var nominacionDocumento in configuracion.NominacionDocumentos)
                {

                    resultado.Add(new DocumentoDto()
                    {
                        Id = nominacionDocumento.Documento.Id,
                        DocumentoTipo = new DocumentoTipoDto()
                        {
                            Id = nominacionDocumento.Documento.DocumentoTipo.Id,
                            Nombre = nominacionDocumento.Documento.DocumentoTipo.Nombre
                        },
                        Nombre = nominacionDocumento.Documento.Nombre,
                        Liquido = nominacionDocumento.Documento.Liquido,
                        Solido = nominacionDocumento.Documento.Solido,
                        Activo = nominacionDocumento.Documento.Activo
                    });
                }
            }
            return resultado;
        }

        public IList<DestinoDto> ListarDestinoPorNominacion(int nominacionId)
        {
            IList<DestinoDto> resultado = new List<DestinoDto>();
            var nominacion = this._repositorio.Obtener<Nominacion>(x => x.Id == nominacionId);
            foreach (var nominacionDestino in nominacion.NominacionDatoTecnico.NominacionDatoTecnicoDestino)
            {
                resultado.Add(new DestinoDto()
                {
                    Id = nominacionDestino.Destino.Id,
                    Nombre = nominacionDestino.Destino.Nombre,
                    Activo = nominacionDestino.Destino.Activo
                });
            }
            return resultado;
        }

        public IList<MaterialPuertoDto> ListarProductosPorNominacion(int nominacionId)
        {
            IList<MaterialPuertoDto> resultado = new List<MaterialPuertoDto>();
            var nominacion = this._repositorio.Obtener<Nominacion>(x => x.Id == nominacionId);
            resultado.Add(new MaterialPuertoDto()
            {
                Id = nominacion.NominacionDatoTecnico.MaterialPuerto.Id,
                CodigoSAP = nominacion.NominacionDatoTecnico.MaterialPuerto.CodigoSAP,
                Descripcion = nominacion.NominacionDatoTecnico.MaterialPuerto.Descripcion,
                DescripcionCorta = nominacion.NominacionDatoTecnico.MaterialPuerto.DescripcionCorta,
                DescripcionCortaIngles = nominacion.NominacionDatoTecnico.MaterialPuerto.DescripcionCortaIngles,
                Almacen_Id = nominacion.NominacionDatoTecnico.MaterialPuerto.Id,
                AlmacenDesc = nominacion.NominacionDatoTecnico.MaterialPuerto.Almacen.Descripcion,
                EsLiquido = nominacion.NominacionDatoTecnico.MaterialPuerto.EsLiquido,
                Color = nominacion.NominacionDatoTecnico.MaterialPuerto.Color,
                Activo = nominacion.NominacionDatoTecnico.MaterialPuerto.Activo,
            });
            return resultado;
        }

        public IList<ConfiguracionDocumentoPorNominacionDto> ListarConfiguracionDocumentoPorNominacion(int nominacionId)
        {
            IList<ConfiguracionDocumentoPorNominacionDto> resultado = new List<ConfiguracionDocumentoPorNominacionDto>();
            var nominacion = this._repositorio.Obtener<Nominacion>(x => x.Id == nominacionId);
            foreach (var documentos in nominacion.ConfiguracionDocumentos)
            {
                resultado.Add(new ConfiguracionDocumentoPorNominacionDto()
                {
                    Id = documentos.Id,
                    Descripcion = string.Format("{0} - {1}", documentos.CoordinadorPuerto.Nombre.Trim(), documentos.Destino.Nombre.Trim())
                });
            }
            return resultado;
        }

        public void CerrarDocumentos(List<int> nomDocIds, string usuario)
        {
            var res = _servicioComandos.Ejecutar(new CerrarNominacionesDocumentos { NomDocIds = nomDocIds, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public IList<DocumentoMotivoAlertaDto> ListarDocumentoMotivoAlerta()
        {
            return Listar<DocumentoMotivoAlerta, DocumentoMotivoAlertaDto>();
        }
        public IList<string> CorreoAlertaDocumentos()
        {
            var correoAlertaDocumentos = this._repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "AlertaDocumentos").Direcciones.Split(';').Select(x => x.Trim()).ToList();
            return correoAlertaDocumentos;
        }

        public void EnviarCorreoAlertaDocumentos(DocumentoEnvioAlertaDto documentoEnvioAlerta)
        {
            _servicioComandos.Ejecutar(new EnvioMail
            {
                Cuerpo = documentoEnvioAlerta.Comentario,
                Destinatarios = documentoEnvioAlerta.Destinatarios.Split(';').ToList(),
                Titulo = documentoEnvioAlerta.Asunto
            });
        }

        public void EnviarMailsAlerta()
        {

            var objDestinatarios = _repositorio.Obtener<ConfiguracionMail>(c => c.TemplateMail == "DocumentacionPendiente") ?? throw new Exception("No se encuentran los destinatarios en la base de datos");
            var destinatarios = objDestinatarios.Direcciones.Split(';').ToList();
            destinatarios.RemoveAll(d => String.IsNullOrEmpty(d));

            if (destinatarios.Count == 0)
            {
                throw new Exception("No se encuentran los destinatarios en la base de datos");
            }

            var res = (ResultadoCrear)_servicioComandos.Ejecutar(new ArmarCuerpoMailDocumentos());
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            var cuerpoMail = res.Mensaje;

            var res2 = _servicioComandos.Ejecutar(new EnvioMail
            {
                Cuerpo = cuerpoMail,
                Destinatarios = destinatarios,
                Titulo = "Reporte día " + DateTime.Now.ToString("dd/MM/yyyy") + ", documentación pendiente en las nominaciones SCATOPUERTO"
            });

            if (res2.HayErrores)
            {
                throw new Exception(res2.Errores[""]);
            }
        }
    }
}
