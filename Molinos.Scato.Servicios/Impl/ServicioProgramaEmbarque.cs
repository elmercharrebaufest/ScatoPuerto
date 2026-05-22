using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Exportador;
using Molinos.Scato.Dominio.Comandos.Exportadores;
using Molinos.Scato.Dominio.Comandos.Productos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Destino;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.ServiciosSap;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.DirectoryServices;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using Molinos.Scato.Utils;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioProgramaEmbarque : IServicioProgramaEmbarque
    {
        private readonly IRepositorio repositorio;
        private readonly IConversor conversor;
        private readonly ILogger log;
        private readonly IServicioComandos comandos;
        private readonly ZSDWS_SCATO servicioSap;

        public ServicioProgramaEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioComandos comandos, ZSDWS_SCATO servicioSap)
        {
            this.repositorio = repositorio;
            this.conversor = conversor;
            this.log = log;
            this.comandos = comandos;
            this.servicioSap = servicioSap;
        }

        public ListaPaginada<ProgramaEmbarqueDto> ListarProgramaDeEmbarque(Paginacion paginacion, DateTime? fecha = null, List<string> muelle = null, List<string> buque = null, List<string> producto = null, bool? zarpo = null)
        {
            var fechaHasta = fecha.HasValue ? new DateTime(fecha.Value.Year, fecha.Value.Month, DateTime.DaysInMonth(fecha.Value.Year, fecha.Value.Month)) : (DateTime?)null;
            return repositorio.ListarConsultaPaginada(new ListarProgramaEmbarqueConsulta(paginacion, fecha, buque, muelle, producto, zarpo));
        }

        public ProgramaEmbarqueDto ListarDatosCombo()
        {
            return repositorio.ObtenerConsultaEscalar(new ListarProgramaEmbarqueCombos());
        }

        public IList<CalidadValorDto> listarCalidadValor()
        {
            try
            {
                return Listar<CalidadValor, CalidadValorDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<TipoDeCalidadDto> listarTipoDeCalidad()
        {
            try
            {
                return Listar<TipoDeCalidad, TipoDeCalidadDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<MuelleDeCargaDto> listarMuelleDeCarga()
        {
            try
            {
                return Listar<MuelleDeCarga, MuelleDeCargaDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<MuelleDto> ListarOtrosMuelles()
        {
            try
            {
                return Listar<Muelle, MuelleDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<SurveyorDto> listarSurveyor()
        {
            try
            {
                return Listar<Surveyor, SurveyorDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<TasaDeCargaDto> listarTasaDeCarga()
        {
            try
            {
                return Listar<TasaDeCarga, TasaDeCargaDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<TipoDeContratoDto> listarTipoDeContrato()
        {
            try
            {
                return Listar<TipoDeContrato, TipoDeContratoDto>(tc => tc.Descripcion != "FAS");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public NominacionDto ObtenerNominacion(int id)
        {
            try
            {
                var nominacion = this.repositorio.Obtener<Nominacion>(nom => nom.Id == id);
                var nominacionDto = conversor.Convertir<Nominacion, NominacionDto>(nominacion);
                bool zarpo = false;

                if (nominacion != null)
                {
                    zarpo = TieneTodosLosEmbarquesZarpados(nominacion);
                }

                if (nominacionDto != null)
                {
                    if (nominacionDto.Embarque != null)
                    {
                        if (nominacionDto.Embarque.Ubicacion == 2)
                            nominacionDto.EnMuelleDeCarga = true;
                    }
                    nominacionDto.Embarque = null;
                    nominacionDto.Zarpo = zarpo;
                }
                return nominacionDto;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int ObtenerEmbarqueIdNominacion(int nominacionId)
        {
            var nominacion = this.repositorio.Obtener<Nominacion>(nom => nom.Id == nominacionId);
            return nominacion?.Embarque?.Id ?? 0;
        }

        // No se puede cambiar de muelle si el plano de carga fue enviado o si el muelle difiere al del embarque (esto es porque se modifico desde lineup)
        public bool PuedeCambiarMuelle(int nominacionId)
        {
            var nominacion = this.repositorio.Obtener<Nominacion>(nom => nom.Id == nominacionId);
            if (nominacion.Embarque == null)
            {
                return true; // No fue enviado aún a lineup
            }

            var muelleNominacion = nominacion.NominacionDatoTecnico.MuelleDeCarga.Descripcion;
            if (muelleNominacion == "San Benito" && !nominacion.Embarque.SanBenito) return false;
            if (muelleNominacion == "Vicentin" && !nominacion.Embarque.Vicentin) return false;
            if (muelleNominacion == "Nouryon" && !nominacion.Embarque.Noryon) return false;
            if (muelleNominacion == "Otros Muelles" && !nominacion.Embarque.OtrosMuelles) return false;

            var lineup = this.repositorio.Obtener<LineUp>(l => l.Embarque.Id == nominacion.Embarque.Id);
            return !lineup.PlanoDeCarga.Enviado;
        }

        private bool TieneTodosLosEmbarquesZarpados(Nominacion nominacion)
        {
            return nominacion.Embarque != null && nominacion.Embarque.Ubicacion == 1 && !nominacion.Embarques.Any() ||
                  (nominacion.Embarque != null && nominacion.Embarque.Ubicacion == 1 &&
                  nominacion.Embarques.Any() && nominacion.Embarques.All(e => e.Embarque.Ubicacion == 1));
        }

        public IList<VaporInformacionDto> listarVaporInformacion()
        {
            try
            {
                return Listar<VaporInformacion, VaporInformacionDto>(v => v.Vapor.Habilitado);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<CompaniaDeFumigacionDto> ListarCompaniaDeFumigacion()
        {
            try
            {
                return Listar<CompaniaDeFumigacion, CompaniaDeFumigacionDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<TipoDeFumigacionDto> ListarTipoDeFumigacion()
        {
            try
            {
                return Listar<TipoDeFumigacion, TipoDeFumigacionDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<MaterialPuertoDto> listarMaterialPuerto()
        {
            try
            {
                return Listar<MaterialPuerto, MaterialPuertoDto>(x => x.DescripcionCorta != null && x.Activo);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<DestinoDto> listarDestino()
        {
            try
            {
                return Listar<Destino, DestinoDto>(d => d.Activo);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<ExportadorDto> listarExportador()
        {
            try
            {
                return Listar<Exportador, ExportadorDto>(e => e.Habilitado);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<CoordinadorPuertoDto> listarCoordinadorPuerto()
        {
            try
            {
                return Listar<CoordinadorPuerto, CoordinadorPuertoDto>(c => c.Habilitado == true);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<BanderaDto> listarBandera()
        {
            try
            {
                return Listar<Bandera, BanderaDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<ATAPuertoDto> listarATAPuerto(bool soloActivas = true)
        {
            try
            {
                // Obtener solo las ATAs activas (siempre filtrar por activas)
                var atas = repositorio.ListarTodos<ATAPuerto>()
                    .Where(a => a.Activa)
                    .OrderBy(a => a.Nombre)
                    .ToList();

                log.Info($"[listarATAPuerto] Total ATAs activas encontradas: {atas.Count}, IDs: {string.Join(", ", atas.Select(a => a.Id))}");

                var resultado = atas.Select(ata => new ATAPuertoDto
                {
                    Id = ata.Id,
                    Nombre = ata.Nombre,
                    Cuit = ata.Cuit,
                    Activa = ata.Activa
                }).ToList();

                return resultado;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<AgenciaMaritimaPuertoDto> listarAgenciaMaritimaPuerto()
        {
            try
            {
                // Obtener solo las agencias marítimas activas
                var agenciasMaritimas = repositorio.ListarTodos<AgenciaMaritimaPuerto>()
                    .Where(a => a.Activa)
                    .OrderBy(a => a.Nombre)
                    .ToList();

                var resultado = agenciasMaritimas.Select(agencia => new AgenciaMaritimaPuertoDto
                {
                    Id = agencia.Id,
                    Nombre = agencia.Nombre,
                    Cuit = agencia.Cuit,
                    CodigoSap = agencia.CodigoSap,
                    Activa = agencia.Activa
                }).ToList();

                return resultado;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<NominacionReciboDto> ObtenerNominacionRecibos(int nominacion_id)
        {
            try
            {
                return Listar<NominacionRecibo, NominacionReciboDto>(x => x.Nominacion.Id == nominacion_id);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void GuardarNominacionRecibo(List<NominacionReciboDto> nominacionRecibo, int nominacion_id)
        {
            try
            {
                //Me traigo todos los nominacion recibo que tengo en la DB que corresponden a esa nominación.
                var nominacionRecibos = repositorio.Listar<NominacionRecibo>(x => x.Nominacion.Id == nominacion_id);

                //Recorro todos los recibos que tengo guardados en la base de datos que correspondan a esa nominación.
                foreach (var recibo in nominacionRecibos.ToList())
                {
                    //Me fijo si el recibo está en la lista que voy a guardar.
                    bool reciboBorrado = nominacionRecibo.FindAll(x => x.Id == recibo.Id).Count == 0;

                    //En caso de no estar, lo elimino de la base de datos.
                    if (reciboBorrado)
                    {
                        repositorio.Remover(recibo);
                    }
                }

                //Recorro todos los recibos a guardar
                foreach (var recibo in nominacionRecibo)
                {
                    //Me traigo el recibo de la DB.
                    NominacionRecibo nominacionReciboDB = repositorio.Obtener<NominacionRecibo>(x => x.Id == recibo.Id);

                    //En caso de que exista piso su data.
                    if (nominacionReciboDB != null)
                    {
                        nominacionReciboDB.NumeroRecibo = recibo.NumeroRecibo;
                        nominacionReciboDB.Formato = recibo.Formato;
                        nominacionReciboDB.Exportador = repositorio.Obtener<Exportador>(x => x.Id == recibo.Exportador.Id);
                        nominacionReciboDB.RecibosPorDia = recibo.RecibosPorDia;
                        nominacionReciboDB.MostrarDestinos = recibo.MostrarDestinos;
                        nominacionReciboDB.MostrarBodegas = recibo.MostrarBodegas;
                        nominacionReciboDB.Cantidad = recibo.Cantidad;
                        nominacionReciboDB.Ajuste = recibo.Ajuste;
                        nominacionReciboDB.DescripcionesBienes = recibo.DescripcionesBienes;
                        nominacionReciboDB.PuertoDeCarga = recibo.PuertoDeCarga;
                        nominacionReciboDB.PuertoDeDescarga = recibo.PuertoDeDescarga;
                        nominacionReciboDB.Unidad = recibo.Unidad;
                        repositorio.GuardarCambios();
                    }
                    //Si no existe lo agrego a la DB.
                    else
                    {
                        var listaRecibos = repositorio.Listar<NominacionRecibo>(x => x.Nominacion.Id == nominacion_id);

                        int numeroRecibo = 1;
                        if (listaRecibos.Count > 0)
                        {
                            numeroRecibo = listaRecibos.Max(x => x.NumeroRecibo);
                            numeroRecibo += 1;
                        }
                        nominacionReciboDB = new NominacionRecibo()
                        {
                            NumeroRecibo = numeroRecibo,
                            Formato = recibo.Formato,
                            Exportador = repositorio.Obtener<Exportador>(x => x.Id == recibo.Exportador.Id),
                            DescripcionesBienes = recibo.DescripcionesBienes,
                            Unidad = recibo.Unidad,
                            PuertoDeDescarga = recibo.PuertoDeDescarga,
                            PuertoDeCarga = recibo.PuertoDeCarga,
                            Ajuste = recibo.Ajuste,
                            Cantidad = recibo.Cantidad,
                            MostrarBodegas = recibo.MostrarBodegas,
                            MostrarDestinos = recibo.MostrarDestinos,
                            RecibosPorDia = recibo.RecibosPorDia,
                            Nominacion = repositorio.Obtener<Nominacion>(x => x.Id == nominacion_id)
                        };
                        //Guardo toda la data en la DB.
                        repositorio.Agregar(nominacionReciboDB);
                        repositorio.GuardarCambios();
                    }
                }
                repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool ValidarCreacionNominacion(NominacionValidaDto nominacion)
        {
            bool bValidacion = true;
            var listaNominaciones = Listar<Nominacion, NominacionDto>(x => x.NominacionDatoTecnico.MaterialPuerto.Id == nominacion.MaterialPuerto.Id &&
                                                                      x.NominacionDatoTecnico.VaporInformacion.Id == nominacion.VaporInformacion.Id &&
                                                                      x.NominacionDatoTecnico.MuelleDeCarga.Id == nominacion.MuelleDeCarga.Id &&
                                                                      x.FechaEliminacion == null &&
                                                                      x.Embarque.Ubicacion != 1 &&
                                                                      x.Id != nominacion.Id);
            if (listaNominaciones.Count > 0) bValidacion = false;
            return bValidacion;
        }

        public bool ValidarPuedeCambiarBuque(int nominacionId)
        {
            var embarque = repositorio.Obtener<Nominacion>(nominacionId).Embarque;
            return embarque == null;
        }

        public bool CrearSurveyor(SurveyorDto surveyor)
        {
            bool bCreado = false;

            try
            {
                var surveyor_BD = new Surveyor();
                surveyor_BD.Descripcion = surveyor.Descripcion;
                surveyor_BD.Mail = surveyor.Mail;
                repositorio.Agregar(surveyor_BD);
                repositorio.GuardarCambios();
                bCreado = true;
            }
            catch (Exception ex)
            {
                bCreado = false;
                throw ex;
            }
            return bCreado;
        }

        public bool CrearTipoDeFumigacion(TipoDeFumigacionDto tipoDeFumigacion)
        {
            bool bCreado = false;

            try
            {
                var tipoDeFumigacion_BD = new TipoDeFumigacion();
                tipoDeFumigacion_BD.Descripcion = tipoDeFumigacion.Descripcion;
                repositorio.Agregar(tipoDeFumigacion_BD);
                repositorio.GuardarCambios();
                bCreado = true;
            }
            catch (Exception ex)
            {
                bCreado = false;
                throw ex;
            }
            return bCreado;
        }

        public bool CrearCompaniaDeFumigacion(CompaniaDeFumigacionDto companiaDeFumigacion)
        {
            bool bCreado = false;

            try
            {
                var companiaDeFumigacion_BD = new CompaniaDeFumigacion();
                companiaDeFumigacion_BD.Descripcion = companiaDeFumigacion.Descripcion;
                companiaDeFumigacion_BD.Mail = companiaDeFumigacion.Mail;
                repositorio.Agregar(companiaDeFumigacion_BD);
                repositorio.GuardarCambios();
                bCreado = true;
            }
            catch (Exception ex)
            {
                bCreado = false;
                throw ex;
            }
            return bCreado;
        }

        public NominacionDto GuardarNominacion(NominacionDto nominacion)
        {
            var nominacion_BD = new Nominacion();

            try
            {
                if (nominacion.Id == 0)
                {
                    nominacion_BD.EnviadoFumigador = nominacion.EnviadoFumigador;
                    nominacion_BD.EnviadoSurveyor = nominacion.EnviadoSurveyor;
                    nominacion_BD.EnviadoOtros = nominacion.EnviadoOtros;
                    nominacion_BD.FechaCreacion = DateTime.Now;
                    nominacion_BD.FechaEnvioLineUp = nominacion.FechaEnvioLineUp;
                    nominacion_BD.FechaEliminacion = nominacion.FechaEliminacion;
                    nominacion_BD.NominacionDatoTecnico = null;
                    nominacion_BD.NominacionRecibo = null;
                    nominacion_BD.NominacionDetalleIntervencion = null;
                    nominacion_BD.ConfiguracionDocumentos = null;
                    repositorio.Agregar(nominacion_BD);
                    repositorio.GuardarCambios();
                    nominacion.Id = nominacion_BD.Id;
                }
                else
                {
                    nominacion_BD = repositorio.Obtener<Nominacion>(x => x.Id == nominacion.Id);
                    nominacion_BD.EnviadoFumigador = nominacion.EnviadoFumigador;
                    nominacion_BD.EnviadoSurveyor = nominacion.EnviadoSurveyor;
                    nominacion_BD.EnviadoOtros = nominacion.EnviadoOtros;
                    nominacion_BD.FechaCreacion = nominacion.FechaCreacion;
                    nominacion_BD.FechaEnvioLineUp = nominacion.FechaEnvioLineUp;
                    nominacion_BD.FechaEliminacion = nominacion.FechaEliminacion;
                    repositorio.GuardarCambios();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return nominacion;
        }

        public void EliminarNominacion(int nominacion_id)
        {
            try
            {
                var nominacion_BD = new Nominacion();
                nominacion_BD = repositorio.Obtener<Nominacion>(x => x.Id == nominacion_id);
                nominacion_BD.FechaEliminacion = DateTime.Now;
                repositorio.GuardarCambios();
                //Se ha eliminado la nominación relacionado con el embarque: “Nombre de buque- Muelle“
                ProcesarNotificacion(TipoNotificacion.Eliminar, nominacion_BD.Embarque);

                var nominacionDocumentos = repositorio.Listar<NominacionDocumento>(d => d.ConfiguracionDocumento.Nominacion.Id == nominacion_id);
                var estadoCerrado = repositorio.Obtener<NominacionDocumentoEstado>(e => e.Estado == "Documento Cerrado");
                foreach (var nominacionDocumento in nominacionDocumentos)
                {
                    nominacionDocumento.NominacionDocumentoEstado = estadoCerrado;
                }
                repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void EliminarNotificacion(int notificacion_id, string username)
        {
            try
            {
                var notificacionExcluidos = repositorio.Agregar(new NotificacionExcluidos
                {
                    NotificacionProgramaDeEmbarque = repositorio.Obtener<NotificacionProgramaDeEmbarque>(x => x.Id == notificacion_id),
                    Username = username
                });

                repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<NotificacionProgramaDeEmbarqueDto> ObtenerNotificaciones(string nombreUsuario)
        {
            try
            {
                //Busco todas las notificaciones
                var notificaciones = repositorio.Listar<NotificacionProgramaDeEmbarque>();
                if (notificaciones != null && notificaciones.Count > 0)
                {
                    foreach (NotificacionProgramaDeEmbarque notificacion in notificaciones.ToList())
                    {
                        //Elimino de la base todas las anteriores a 10 días desde su creación.
                        if (notificacion.Fecha < DateTime.Now.AddDays(-10))
                        {
                            IList<NotificacionExcluidos> notificacionExcluidos = repositorio.Listar<NotificacionExcluidos>(x => x.NotificacionProgramaDeEmbarque.Id == notificacion.Id);
                            repositorio.RemoverTodos(notificacionExcluidos);
                            repositorio.Remover(notificacion);
                        }
                    }

                    //guardo los cambios
                    repositorio.GuardarCambios();
                }

                var notificacionesDto = Listar<NotificacionProgramaDeEmbarque, NotificacionProgramaDeEmbarqueDto>();

                var excluidasUsuario = repositorio.Listar<NotificacionExcluidos>(x => x.Username == nombreUsuario);

                foreach (NotificacionProgramaDeEmbarqueDto notificacion1 in notificacionesDto.ToList())
                {
                    if (excluidasUsuario.Any(x => x.NotificacionProgramaDeEmbarque.Id == notificacion1.Id))
                    {
                        notificacionesDto.Remove(notificacion1);
                    }
                }
                return notificacionesDto.OrderByDescending(x => x.Fecha).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public enum TipoNotificacion
        {
            Agregar = 0,
            Eliminar = 1,
            Modificar = 2
        }

        public void ProcesarNotificacion(TipoNotificacion tipoNotificacion, Embarque embarque = null, EmbarqueDto embarqueDto = null, NominacionDto nominacionDto = null)
        {
            string mensaje = "";
            string muelle = "";

            if (embarqueDto != null)
            {
                muelle = (embarqueDto.Vicentin == true ? "vicentin" : embarqueDto.Noryon == true ? "Noryon" : embarqueDto.SanBenito == true ? "San Benito" : "Otros muelles");
                switch (tipoNotificacion)
                {
                    case TipoNotificacion.Agregar:
                        mensaje = "Se ha agregado un nuevo embarque - " + embarqueDto.Vapor.Nombre + " + " + muelle;
                        break;

                    case TipoNotificacion.Eliminar:
                        mensaje = "Se ha eliminado la nominación relacionado con el embarque: " + embarqueDto.Vapor.Nombre + " + " + muelle;
                        break;

                    case TipoNotificacion.Modificar:
                        mensaje = "Se ha editado un embarque " + embarqueDto.Vapor.Nombre + " + " + muelle + ": Producto -> " + nominacionDto.NominacionDatoTecnico.MaterialPuerto.Descripcion + ".";
                        break;
                }
            }

            if (embarque != null)
            {
                muelle = (embarque.Vicentin == true ? "vicentin" : embarque.Noryon == true ? "Noryon" : embarque.SanBenito == true ? "San Benito" : "Otros muelles");
                switch (tipoNotificacion)
                {
                    case TipoNotificacion.Agregar:
                        mensaje = "Se ha agregado un nuevo embarque - " + embarque.Vapor.Nombre + " + " + muelle;
                        break;

                    case TipoNotificacion.Eliminar:
                        mensaje = "Se ha eliminado la nominación relacionado con el embarque: " + embarque.Vapor.Nombre + " + " + muelle;
                        break;
                }
            }

            NotificacionProgramaDeEmbarque notificacionProgramaDeEmbarque = new NotificacionProgramaDeEmbarque()
            {
                Fecha = DateTime.Now,
                Mensaje = mensaje,
                TipoAlerta = Dominio.Enums.TipoAlerta.CartaPorte
            };
            AgregarNotificacion(notificacionProgramaDeEmbarque);
        }

        public void AgregarNotificacion(NotificacionProgramaDeEmbarque notificacionProgramaDeEmbarque)
        {
            try
            {
                if (notificacionProgramaDeEmbarque != null)
                {
                    repositorio.Agregar(notificacionProgramaDeEmbarque);
                    repositorio.GuardarCambios();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public MailDto ObtenerDatosMailProgramaEmbarque(NominacionDto nominacion, string tipoDeMail)
        {
            // CARACTERES NO IMPRIMIBLES:
            // Enter: (\n -> <br/>)
            // Tabulador: (\t -> &nbsp;&nbsp;&nbsp;&nbsp;)
            // Negrita: (\f -> <b>) (\f\f -> </b>)
            // Subrayado: (\0 -> <u>) (\0\0 -> </u>)
            var copia = new List<string>();
            copia = repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "PlanillaProgramaEmbarqueCopia").Direcciones.Split(';').ToList();

            string campoMail = "";
            if (tipoDeMail == "Surveyor" && nominacion.NominacionDatoTecnico != null && nominacion.NominacionDatoTecnico.Surveyor != null)
                campoMail = nominacion.NominacionDatoTecnico.Surveyor.Mail;
            else if (tipoDeMail == "Fumigador" && nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion.CompaniaDeFumigacion != null)
                campoMail = nominacion.NominacionDetalleIntervencion.CompaniaDeFumigacion.Mail;

            var direccionesExtra = campoMail.Split(';').Select(x => x.Trim());
            copia.AddRange(direccionesExtra);

            copia.RemoveAll(item => item == null || item == "");

            var mail = new MailDto
            {
                Destinatarios = repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "PlanillaProgramaEmbarque").Direcciones.Split(';').ToList(),
                Copia = copia,
            };
            return mail;
        }

        public IList<AuditoriaDto> ObtenerAuditoria(int nominacion_id)
        {
            try
            {
                return Listar<Auditoria, AuditoriaDto>(x => x.Nominacion_Id == nominacion_id);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void ActualizarDatosYEnviarMail(MailDto mail)
        {
            try
            {
                var nominacion = repositorio.Obtener<Nominacion>(x => x.Id == mail.Id);
                string htmlConfirma = ObtenerHtmlConfirmarRecepcion(nominacion, mail);
                mail.Body = htmlConfirma + mail.Body;

                if (mail.TipoDeMail == "Surveyor")
                {
                    nominacion.EnviadoSurveyor = true;
                }
                else if (mail.TipoDeMail == "Fumigador")
                {
                    nominacion.EnviadoFumigador = true;
                }
                else
                {
                    nominacion.EnviadoOtros = true;
                }
                EnviarMail(mail);
                repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private string ObtenerHtmlConfirmarRecepcion(Nominacion nominacion, MailDto mail)
        {
            string destinatarios = this.repositorio.Obtener<ConfiguracionMail>(m => m.TemplateMail == "AvisoLecturaProgramaEmbarque").Direcciones.Replace("; ", ",").Replace(",", ";");
            string htmlRecepcion = $@"
               <div style=""font-family: Arial, Helvetica, sans-serif;"">
                 <p>Atención, por favor confirme la recepción de este correo haciendo clic en el siguiente botón:</p>
                 <a href=""mailto:{destinatarios}?subject=Confirmaci%C3%B3n%20de%20recepci%C3%B3n%20-%20{mail.Titulo}
                    &body=Confirmo%20recepci%C3%B3n%20del%20correo%20sobre%20la%20nominaci%C3%B3n%20del%20buque:%20{nominacion.Embarque.Vapor.Nombre}.""
                 style=""display: inline-block; padding: 10px 20px; background-color: #0273d4; color: white; text-decoration: none; border-radius: 5px; text-align: center;"">
                CONFIRMAR RECEPCIÓN
                 </a>
               </div>
               <br/>";

            return htmlRecepcion;
        }

        public void EnviarMail(MailDto mail)
        {
            try
            {
                if (!string.IsNullOrEmpty(mail.MailEmisor))
                {
                    mail.Copia.Add(mail.MailEmisor);
                }
                var mails = repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "PlanillaProgramaEmbarqueCopia");
                if (mails != null)
                {
                    mail.Copia.Add(mails.Direcciones);
                }

                mail.Copia = mail.Copia.Distinct().ToList();
                mail.Destinatarios = mail.Destinatarios.Distinct().ToList();
                mail.Copia.RemoveAll(item => item == null || item == "");
                mail.Destinatarios.RemoveAll(item => item == null || item == "");

                comandos.Ejecutar(new EnvioMail
                {
                    Cuerpo = mail.Body.Replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
                           .Replace("\f\f", "</b>").Replace("\f", "<b>").Replace("\0\0", "</u>").Replace("\0", "<u>"),
                    Destinatarios = mail.Destinatarios,
                    Titulo = mail.Titulo,
                    Copia = mail.Copia,
                    AttachmentName = null,
                });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private string ObtenerMailDeActiveDirectory(string UserName)
        {
            DirectoryEntry entry = new DirectoryEntry();
            string userName = UserName;
            try
            {
                var userNameArray = UserName.Split('\\');
                userName = userNameArray.Length == 1 ? userNameArray[0] : userNameArray[1];
            }
            catch { }

            DirectorySearcher search = new DirectorySearcher(entry);
            search.Filter = "(sAMAccountName=" + userName + ")";
            search.PropertiesToLoad.Add("givenName");   // first name
            search.PropertiesToLoad.Add("sn");          // last name
            search.PropertiesToLoad.Add("mail");        // smtp mail address

            // perform the search
            try
            {
                SearchResult result = search.FindOne();
                return result.Properties.Contains("mail") ? result.Properties["mail"][0].ToString() : result.Properties["userPrincipalName"][0].ToString();
            }
            catch
            {
                log.Error($"No se encontró el mail en AD para el usuario {userName}");
            }
            return string.Empty;
        }

        public List<Tuple<int, bool>> TieneAuditoria(int[] nominaciones_id)
        {
            try
            {
                List<Tuple<int, bool>> auditoriasNominaciones = new List<Tuple<int, bool>>();
                foreach (int nominacion_id in nominaciones_id)
                {
                    auditoriasNominaciones.Add(new Tuple<int, bool>(nominacion_id, repositorio.Listar<Auditoria>(x => x.Nominacion_Id == nominacion_id).Count > 0 ? true : false));
                }
                return auditoriasNominaciones;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<VaporInformacionDto> ListarBuquesNominacion()
        {
            List<VaporInformacionDto> vapores = new List<VaporInformacionDto>();
            try
            {
                var listaNominacion = Listar<Nominacion, NominacionDto>(x => x.FechaEliminacion == null && x.FechaEnvioLineUp == null);
                var listaVapores = listaNominacion.Select(s => s.NominacionDatoTecnico.VaporInformacion);
                listaVapores = listaVapores.Distinct().ToArray();
                foreach (var vapor in listaVapores)
                {
                    if (vapores.FindIndex(x => x.Id == vapor.Id) == -1)
                        vapores.Add(vapor);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return vapores;
        }

        public IList<NominacionLineUpDto> ListarNominacionPorBuque(int vaporInformacion_Id)
        {
            List<NominacionLineUpDto> nominacionLineUps = new List<NominacionLineUpDto>();
            try
            {
                NominacionLineUpDto nominacionLineUpDto = null;
                var listaNominacion = Listar<Nominacion, NominacionDto>(x => x.FechaEliminacion == null && x.FechaEnvioLineUp == null && x.NominacionDatoTecnico.VaporInformacion.Id == vaporInformacion_Id);
                foreach (var nominacion in listaNominacion)
                {
                    nominacionLineUpDto = new NominacionLineUpDto();
                    nominacionLineUpDto.Vapor_Id = nominacion.NominacionDatoTecnico.VaporInformacion.Vapor.Id;
                    nominacionLineUpDto.Nominacion_Id = nominacion.Id;
                    nominacionLineUpDto.MaterialPuerto = nominacion.NominacionDatoTecnico.MaterialPuerto;
                    nominacionLineUpDto.MuelleDeCarga = nominacion.NominacionDatoTecnico.MuelleDeCarga;
                    nominacionLineUpDto.Embarque_Id = nominacion.Embarque == null ? 0 : nominacion.Embarque.Id;
                    nominacionLineUpDto.EnviadoLineUp = nominacion.FechaEnvioLineUp != null ? true : false;
                    nominacionLineUpDto.FechaEnvioLineUp = nominacion.FechaEnvioLineUp;

                    var cargadorPorCantidad = nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador.Select(x => new
                    {
                        Exportador = x.Exportador,
                        Cantidad = x.Cantidad
                    }).GroupBy(s => new { s.Exportador })
                    .Select(g => new
                    {
                        Exportador = g.Key.Exportador,
                        Cantidad = g.Sum(x => x.Cantidad)
                    });
                    Collection<NominacionCargadorPorCantidadDto> mominacionCargadorPorCantidad = new Collection<NominacionCargadorPorCantidadDto>();
                    foreach (var cargador in cargadorPorCantidad)
                    {
                        mominacionCargadorPorCantidad.Add(new NominacionCargadorPorCantidadDto
                        {
                            Exportador = cargador.Exportador,
                            Cantidad = cargador.Cantidad
                        });
                    }
                    nominacionLineUpDto.NominacionCargadorPorCantidad = mominacionCargadorPorCantidad;
                    nominacionLineUps.Add(nominacionLineUpDto);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return nominacionLineUps;
        }

        public ProgramaEmbarqueValidacionLineUpDto ObtenerEmbarque(int materialPuerto_Id, int muelleDeCarga_Id, int vapor_Id)
        {
            ProgramaEmbarqueValidacionLineUpDto programaEmbarqueValidacionLineUp = new ProgramaEmbarqueValidacionLineUpDto();
            try
            {
                var muelleDeCarga = Obtener<MuelleDeCarga, MuelleDeCargaDto>(x => x.Id == muelleDeCarga_Id);
                bool vicentin = muelleDeCarga.Descripcion == "Vicentin" ? true : false;
                bool noryon = muelleDeCarga.Descripcion == "Nouryon" ? true : false;
                bool sanBenito = muelleDeCarga.Descripcion == "San Benito" ? true : false;
                bool otrosMuelles = muelleDeCarga.Descripcion == "Otros Muelles" ? true : false;

                var embarques = Listar<Embarque, EmbarqueDto>(x => x.Vapor.Id == vapor_Id &&
                                                                         x.Vicentin == vicentin &&
                                                                         x.SanBenito == sanBenito &&
                                                                         x.OtrosMuelles == otrosMuelles &&
                                                                         x.Noryon == noryon &&
                                                                         x.Ubicacion != 1);
                if (embarques.Count > 0)
                {
                    foreach (var embarque in embarques)
                    {
                        var materialesPuertoCantidad = embarque.MaterialesPuertoCantidad.FirstOrDefault(x => x.MaterialId == materialPuerto_Id);
                        MaterialPuertoCantidadExisteDto materialesExistentes = new MaterialPuertoCantidadExisteDto();

                        materialesExistentes.MaterialesPuertoCantidad = materialesPuertoCantidad;
                        materialesExistentes.Existe = materialesPuertoCantidad != null ? true : false;

                        programaEmbarqueValidacionLineUp.ProgramaEmbarqueEmbarqueMaterial = new ProgramaEmbarqueMaterialDto()
                        {
                            Embarque = embarque,
                            MaterialesExistentes = materialesExistentes
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return programaEmbarqueValidacionLineUp;
        }

        public IList<EmbarqueDto> ObtenerEmbarquePorVapor(int materialPuerto_Id, int muelleDeCarga_Id, int vapor_Id)
        {
            try
            {
                return Listar<Embarque, EmbarqueDto>(x => x.Vapor.Id == vapor_Id && x.EstadoBuque.Descripcion == "PreOperativo" && x.Ubicacion != 1);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void AsociarEmbarquePorNominacionEnviada(int nominacion_Id, int embarque_Id, string observacion)
        {
            try
            {
                Nominacion nominacion = repositorio.Obtener<Nominacion>(nominacion_Id);
                Embarque embarque = repositorio.Obtener<Embarque>(embarque_Id);
                LineUp lineUp = repositorio.Listar<LineUp>(e => e.Embarque.Id == embarque_Id).FirstOrDefault();
                PlanoDeCarga planoDeCarga = repositorio.Obtener<PlanoDeCarga>(lineUp.PlanoDeCarga.Id);

                var senasa = nominacion.NominacionDetalleIntervencion.Senasa?.FirstOrDefault();
                embarque.Senasa = false;
                if (senasa != null)
                {
                    embarque.Senasa = senasa.TieneSenasa;
                }

                var listaSenasa = nominacion.NominacionDetalleIntervencion.Senasa;
                if (listaSenasa != null)
                {
                    embarque.Gmo = listaSenasa.Any(s => s.GMO == true);
                    embarque.Fito = listaSenasa.Any(s => s.FITO == true);
                    embarque.CertificadoInocuidad = listaSenasa.Any(s => s.CertificadoInocuidad == true);
                    embarque.CertificadoVeterinario = listaSenasa.Any(s => s.CertificadoVeterinario == true);
                    embarque.MuestraOficial = listaSenasa.Any(s => s.MuestraOficial == true);
                }

                bool isFumigado = string.Equals(nominacion.NominacionDetalleIntervencion.Fumigacion?.ToUpper(), "SI");
                planoDeCarga.Fumigacion = isFumigado;

                if (isFumigado)
                {
                    planoDeCarga.EmpresaFumigadora = nominacion.NominacionDetalleIntervencion.CompaniaDeFumigacion?.Descripcion;
                }

                nominacion.Embarque = embarque;
                nominacion.FechaEnvioLineUp = DateTime.Now;
                nominacion.ObservacionEnvioLineUp = observacion;
                repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void AgregarMaterialesPorNominacionEnviada(int nominacion_Id, int embarque_Id)
        {
            try
            {
                Nominacion nominacion = repositorio.Obtener<Nominacion>(nominacion_Id);
                MaterialPuertoCantidad materialPuertoCantidad = new MaterialPuertoCantidad();
                materialPuertoCantidad.Embarque = repositorio.Obtener<Embarque>(embarque_Id);
                materialPuertoCantidad.Cantidad = (int)nominacion.NominacionDatoTecnico.CantidadTotal;
                materialPuertoCantidad.MaterialPuerto = nominacion.NominacionDatoTecnico.MaterialPuerto;
                materialPuertoCantidad.Color = nominacion.NominacionDatoTecnico.MaterialPuerto.Color;
                repositorio.Agregar(materialPuertoCantidad);
                repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Elimina o descuenta la cantidad de un material asociado a un embarque cuando se cambia el muelle.
        /// Si la cantidad del material llega a cero o menos, elimina la entidad MaterialPuertoCantidad de la base de datos.
        /// Devuelve true si, después de la operación, el embarque no tiene más materiales asociados; de lo contrario, false.
        /// </summary>
        /// <param name="nominacionId">ID de la nominación que contiene la información del material a descontar.</param>
        /// <param name="embarqueId">ID del embarque del que se eliminará o descontará el material.</param>
        /// <returns>True si el embarque queda sin materiales asociados; false en caso contrario.</returns>
        public bool EliminarMaterialPorCambioDeMuelle(int nominacionId, int embarqueId)
        {
            var embarque = repositorio.Obtener<Embarque>(embarqueId);
            var nominacion = repositorio.Obtener<Nominacion>(nominacionId);
            MaterialPuertoCantidad materialPuertoCantidad = repositorio.Obtener<MaterialPuertoCantidad>(x =>
                x.Embarque.Id == embarqueId && x.MaterialPuerto.Id == nominacion.NominacionDatoTecnico.MaterialPuerto.Id);

            materialPuertoCantidad.Cantidad -= (int)nominacion.NominacionDatoTecnico.CantidadTotal;
            if (materialPuertoCantidad.Cantidad <= 0)
            {
                repositorio.Remover(materialPuertoCantidad);
            }

            repositorio.GuardarCambios();

            return embarque.MaterialPuertoCantidad.Count == 0;
        }

        public IList<NominacionDto> ListarNominacionesExcel()
        {
            var nominaciones = (from n in repositorio.Listar<Nominacion>()
                                join e in repositorio.Listar<Embarque>() on n.Embarque?.Id equals e.Id
                                join l in repositorio.Listar<LineUp>() on e.Id equals l.Embarque?.Id
                                // join r in repositorio.Listar<Recorrido>() on l.Recorrido.Id equals r.Id
                                join v in repositorio.Listar<Vapor>() on e.Vapor.Id equals v.Id
                                where e.Ubicacion != 1 && l.ModuloDeCarga != null && l.ModuloDeCarga.Id > 0 && n.FechaEnvioLineUp != null && n.FechaEliminacion == null && l.Ocultar == false
                                orderby e.OtrosMuelles, e.Vicentin, l.Orden ascending
                                select (n)).ToList();
            return conversor.ConvertirList<Nominacion, NominacionDto>(nominaciones);
        }

        public void EnviarMailNominacionesExcel(byte[] archivo)
        {
            var objDestinatarios = repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "NominacionesExcel");
            if (objDestinatarios == null) throw new Exception("No se encuentran los destinatarios en la base de datos");
            var destinatarios = objDestinatarios.Direcciones.Split(';').ToList();
            destinatarios.RemoveAll(x => String.IsNullOrEmpty(x));
            if (destinatarios.Count == 0) throw new Exception("No se encuentran los destinatarios en la base de datos");
            comandos.Ejecutar(new EnvioMail
            {
                Cuerpo = "Se adjunta planilla excel con los programas de embarque",
                Destinatarios = destinatarios,
                Titulo = "Planilla programa de embarque" + DateTime.Now.ToString("dd/MM/yyyy"),
                Attachment = archivo,
                AttachmentName = "Planilla programa de embarque.xls"
            });
        }

        #region Agencias Maritimas ATA

        public ListaPaginada<AgenciaMaritimaATADto> ListarAgenciasATA(Paginacion paginacion, string nombre, string cuit, int tipo)
        {
            return repositorio.ListarConsultaPaginada(new ListarAgenciasATAConsulta(paginacion, nombre, cuit, tipo));
        }

        public List<AgenciaMaritimaATADto> ListarAgenciasATASinPaginar(string nombre, string cuit, int tipo)
        {
            var paginacion = new Paginacion();
            var listaPaginada = repositorio.ListarConsultaPaginada(new ListarAgenciasATAConsulta(paginacion, nombre, cuit, tipo));
            return listaPaginada.Items.ToList();
        }

        public ATAPuertoDto ObtenerATAPuerto(int id)
        {
            return Obtener<ATAPuerto, ATAPuertoDto>(id);
        }

        public AgenciaMaritimaPuertoDto ObtenerAgenciaMaritimaPuerto(int id)
        {
            return Obtener<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>(id);
        }

        public void CrearAgenciaMaritimaATA(CrearAgenciaMaritimaATADto agenciaATA, string usuario)
        {
            var res = comandos.Ejecutar(new CrearAgenciaMaritimaATA { Dto = agenciaATA, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void ModificarAgenciaMaritimaATA(ModificarAgenciaMaritimaATADto agencia, string usuario)
        {
            var res = comandos.Ejecutar(new ModificarAgenciaMaritimaATA { Dto = agencia, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void EliminarAgenciaMaritimaATA(int id, int tipo, string usuario)
        {
            var res = comandos.Ejecutar(new EliminarAgenciaMaritimaATA { Id = id, Tipo = tipo, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public AgenciaMaritimaPuertoDto ConsultarAgenciaMaritimaPorCuitEnSap(string cuit)
        {
            try
            {
                log.Debug($"[ConsultarAgenciaMaritimaPorCuitEnSap] Iniciando consulta SAP para CUIT: {cuit}");

                var request = new Z_SDMF_RFC_DATOS_CLIENTE3Request
                {
                    Z_SDMF_RFC_DATOS_CLIENTE3 = new Z_SDMF_RFC_DATOS_CLIENTE3
                    {
                        IM_CUIT = cuit,
                        IM_FECHA = "",
                        IM_ID_SAP = ""
                    }
                };

                log.Debug($"[ConsultarAgenciaMaritimaPorCuitEnSap] Request SAP:\n{XmlConverter<Z_SDMF_RFC_DATOS_CLIENTE3Request>.Serialize(request)}");

                var respuesta = servicioSap.Z_SDMF_RFC_DATOS_CLIENTE3(request);

                log.Debug($"[ConsultarAgenciaMaritimaPorCuitEnSap] Respuesta SAP recibida. Cantidad de clientes: {respuesta.Z_SDMF_RFC_DATOS_CLIENTE3Response.EX_CLIENTES?.Length ?? 0}");
                log.Debug($"[ConsultarAgenciaMaritimaPorCuitEnSap] Respuesta SAP completa:\n{XmlConverter<Z_SDMF_RFC_DATOS_CLIENTE3Response1>.Serialize(respuesta)}");

                if (respuesta.Z_SDMF_RFC_DATOS_CLIENTE3Response.EX_CLIENTES == null ||
                    respuesta.Z_SDMF_RFC_DATOS_CLIENTE3Response.EX_CLIENTES.Length == 0)
                {
                    log.Debug($"[ConsultarAgenciaMaritimaPorCuitEnSap] No se encontraron clientes para el CUIT: {cuit}");
                    return null;
                }

                var cliente = respuesta.Z_SDMF_RFC_DATOS_CLIENTE3Response.EX_CLIENTES[0];

                var agenciaDto = new AgenciaMaritimaPuertoDto
                {
                    Nombre = cliente.ZNOMBRE,
                    CodigoSap = cliente.ID_SAP?.TrimStart('0'),
                    Cuit = cliente.ZCUIT
                };

                log.Debug($"[ConsultarAgenciaMaritimaPorCuitEnSap] Agencia encontrada: {agenciaDto.Nombre}, Código SAP: {agenciaDto.CodigoSap}");

                return agenciaDto;
            }
            catch (Exception ex)
            {
                log.Error($"[ConsultarAgenciaMaritimaPorCuitEnSap] Error al consultar SAP: {ex.Message}", ex);
                throw new Exception($"Error al consultar en SAP: {ex.Message}", ex);
            }
        }

        #endregion Agencias Maritimas ATA

        #region Destinos

        public ListaPaginada<DestinoDto> ListarDestinos(string nombre, int pagina = 0, int itemsPorPagina = 0)
        {
			IQueryable<Destino> query = repositorio.Incluir<Destino>(d => d.Bandera)
				.Where(d => d.Activo && (string.IsNullOrEmpty(nombre) || d.Nombre.Contains(nombre)))
                .OrderBy(d => d.Nombre);

            var itemsTotales = query.Count();
            if (pagina > 0 && itemsPorPagina > 0)
            {
                var saltear = (pagina - 1) * itemsPorPagina;
                query = query.Skip(saltear).Take(itemsPorPagina);
            }

            var destinosDb = query.ToList();
            var destinos = conversor.ConvertirList<Destino, DestinoDto>(destinosDb);

            return new ListaPaginada<DestinoDto>(destinos, pagina, itemsPorPagina, itemsTotales);
        }

        public void CrearDestino(AltaEdicionDestinoDto destino, string usuario)
        {
            var res = comandos.Ejecutar(new CrearDestinoPuerto { Destino = destino, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void ModificarDestino(AltaEdicionDestinoDto destino, string usuario)
        {
            var res = comandos.Ejecutar(new ModificarDestinoPuerto { Destino = destino, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void EliminarDestino(int id, string usuario)
        {
            var res = comandos.Ejecutar(new EliminarDestinoPuerto { Id = id, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        #endregion Destinos

        #region Metodos Utiles

        private IList<TDto> Listar<TEntidad, TDto>() where TEntidad : class
        {
            return conversor.ConvertirList<TEntidad, TDto>(repositorio.Listar<TEntidad>());
        }

        private IList<TDto> Listar<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
        {
            return conversor.ConvertirList<TEntidad, TDto>(repositorio.Listar(expresionFiltro));
        }

        private TDto Obtener<TEntidad, TDto>(int id) where TEntidad : class
        {
            return conversor.Convertir<TEntidad, TDto>(repositorio.Obtener<TEntidad>(id));
        }

        private TDto Obtener<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
        {
            return conversor.Convertir<TEntidad, TDto>(repositorio.Obtener(expresionFiltro));
        }

        #endregion Metodos Utiles

        #region ABM Exportadores/Cargadores

        public ListaPaginada<ExportadorDto> ListarExportadoresPaginado(Paginacion paginacion, string nombre)
        {
            return repositorio.ListarConsultaPaginada(new ListarExportadoresConsulta(paginacion, nombre));
        }

        public IList<ExportadorDto> ListarExportadores(string nombre)
        {
            var exportadores = conversor.ConvertirList<Exportador, ExportadorDto>(
                this.repositorio.Listar<Exportador>(e => e.Habilitado &&
                (string.IsNullOrEmpty(nombre) || e.Nombre.Contains(nombre))));

            return exportadores;
        }

        public void CrearExportador(ExportadorDto exportador, string usuario)
        {
            var res = comandos.Ejecutar(new CrearExportadorPuerto { Dto = exportador, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void EditarExportador(ExportadorDto exportador, string usuario)
        {
            var res = comandos.Ejecutar(new ModificarExportadorPuerto { Dto = exportador, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public ExportadorDto ObtenerExportador(int id)
        {
            return Obtener<Exportador, ExportadorDto>(id);
        }

        public void EliminarExportador(int id, string usuario)
        {
            var res = comandos.Ejecutar(new EliminarExportadorPuerto { Id = id, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public ExportadorDto ConsultarExportadorPorCuitEnSap(string cuit)
        {
            try
            {
                log.Debug($"[ConsultarExportadorPorCuitEnSap] Iniciando consulta a SAP para CUIT: {cuit}");

                var request = new Z_SDMF_RFC_DATOS_CLIENTE3Request(
                    new Z_SDMF_RFC_DATOS_CLIENTE3
                    {
                        IM_CUIT = cuit,
                        IM_FECHA = "",
                        IM_ID_SAP = ""
                    }
                );

                log.Debug($"[ConsultarExportadorPorCuitEnSap] Request SAP - CUIT: '{request.Z_SDMF_RFC_DATOS_CLIENTE3.IM_CUIT}', FECHA: '{request.Z_SDMF_RFC_DATOS_CLIENTE3.IM_FECHA}', ID_SAP: '{request.Z_SDMF_RFC_DATOS_CLIENTE3.IM_ID_SAP}'");

                var respuesta = servicioSap.Z_SDMF_RFC_DATOS_CLIENTE3(request);

                log.Debug($"[ConsultarExportadorPorCuitEnSap] Respuesta SAP completa:\n{XmlConverter<Z_SDMF_RFC_DATOS_CLIENTE3Response1>.Serialize(respuesta)}");
                if (respuesta.Z_SDMF_RFC_DATOS_CLIENTE3Response.EX_CLIENTES != null && 
                    respuesta.Z_SDMF_RFC_DATOS_CLIENTE3Response.EX_CLIENTES.Length > 0)
                {
                    var clienteSap = respuesta.Z_SDMF_RFC_DATOS_CLIENTE3Response.EX_CLIENTES.FirstOrDefault();

                    if (clienteSap != null)
                    {
                        log.Debug($"[ConsultarExportadorPorCuitEnSap] Cliente encontrado - Nombre: {clienteSap.ZNOMBRE}, Código SAP: {clienteSap.ID_SAP}, CUIT: {clienteSap.ZCUIT}");

                        var exportadorDto = new ExportadorDto
                        {
                            Nombre = clienteSap.ZNOMBRE?.Trim() ?? "",
                            CodigoSap = clienteSap.ID_SAP?.TrimStart('0') ?? "",
                            Cuit = clienteSap.ZCUIT?.Trim() ?? cuit
                        };

                        log.Debug($"[ConsultarExportadorPorCuitEnSap] Nombre: {exportadorDto.Nombre}, CodigoSap: {exportadorDto.CodigoSap}, Cuit: {exportadorDto.Cuit}");

                        return exportadorDto;
                    }
                }

                log.Debug($"[ConsultarExportadorPorCuitEnSap] No se encontró cliente en SAP para CUIT: {cuit}");
                return null;
            }
            catch (Exception ex)
            {
                log.Error(ex, $"[ConsultarExportadorPorCuitEnSap] Error al consultar exportador por CUIT en SAP: {cuit}");

                if (ex.InnerException != null)
                {
                    log.Error(ex.InnerException, $"[ConsultarExportadorPorCuitEnSap] InnerException: {ex.InnerException.Message}");
                }

                throw new Exception($"Error al consultar en SAP: {ex.Message}", ex);
            }
        }

        #endregion ABM Exportadores/Cargadores

        public void CrearNominacionFAS(int embarqueId, List<NominacionReciboDto> recibos)
        {
            var resultado = comandos.Ejecutar(new CrearEmbarqueFAS { EmbarqueId = embarqueId, Recibos = recibos });
            if (resultado.HayErrores)
            {
                throw new Exception(resultado.Errores[""]);
            }
        }

        #region ABM Producto

        public ListaPaginada<MaterialPuertoDto> ListarProductosPaginado(string nombre, int pagina, int itemsPorPagina, List<string> listTipoDeProducto = null)
        {
            var paginacion = new Paginacion(null, DirOrden.Asc, pagina, itemsPorPagina == 0 ? 10 : itemsPorPagina);
            return repositorio.ListarConsultaPaginada(new ListarProductosConsulta(paginacion, nombre, listTipoDeProducto));
        }

        public IList<ProductoDto> ListarProductosConCalidades(string nombre)
        {
            var lista = new List<ProductoDto>();

            var productos = this.repositorio.ListarTodos<MaterialPuerto>().AsQueryable();
            var tipoCalidades = this.repositorio.ListarTodos<TipoDeCalidad>().AsQueryable();
            var valores = this.repositorio.ListarTodos<CalidadValor>().AsQueryable();

            var query = from p in productos
                        join tc in tipoCalidades on p.Id equals tc.MaterialPuerto.Id into tcGroup
                        from tc in tcGroup.DefaultIfEmpty()  // LEFT JOIN
                        join v in valores on tc.Id equals v.TipoDeCalidad.Id into vGroup
                        from v in vGroup.DefaultIfEmpty()
                        where p.Activo && (tc == null || tc.Activo) && (v == null || v.Activo) &&
                        (p.Descripcion.ToLower().Contains(nombre.ToLower()) || nombre == null)
                        select new
                        {
                            p.Id,
                            p.Descripcion,
                            p.DescripcionCorta,
                            p.EsLiquido,
                            TipoCalidad = tc != null ? tc.Descripcion : null,
                            Parametro = v != null ? v.Parametro : null,
                            Valor = v != null ? v.Valor : null
                        };

            var resultados = query.ToList();

            var productosDto = resultados
                .GroupBy(x => new { x.Id, x.Descripcion, x.DescripcionCorta, x.EsLiquido })
                .Select(g => new ProductoDto
                {
                    Descripcion = g.Key.Descripcion,
                    DescripcionCorta = g.Key.DescripcionCorta,
                    FormatoMaterial = g.Key.EsLiquido ? "Líquido" : "Sólido",
                    Calidades = g.Where(x => x.TipoCalidad != null)
                                 .GroupBy(x => x.TipoCalidad)
                                 .Select(cg => new CalidadProductoDto
                                 {
                                     TipoCalidad = cg.Key,
                                     Valores = cg.Select(x => new ParametroValorDto
                                     {
                                         Parametro = x.Parametro,
                                         Valor = x.Valor
                                     }).ToList()
                                 }).ToList()
                }).OrderBy(p => p.Descripcion).ToList();

            lista = productosDto;
            return lista;
        }

        public RegistroProductoDto ObtenerProducto(int id)
        {
            var material = Obtener<MaterialPuerto, MaterialPuertoDto>(id);
            var tiposDeCalidad = Listar<TipoDeCalidad, TipoDeCalidadDto>(tc => tc.MaterialPuerto.Id == id && tc.Activo);
            var documentos = Listar<DocumentoMaterialPuerto, DocumentoMaterialPuertoDto>(d => d.MaterialPuerto.Id == id).ToList();
            var listaTc = tiposDeCalidad.Select(tc => new RegistroTipoDeCalidadDto
            {
                TipoDeCalidad = tc,
                CalidadValores = Listar<CalidadValor, CalidadValorDto>(cv => cv.TipoDeCalidad.Id == tc.Id && cv.Activo).ToList()
            }).ToList();

            return new RegistroProductoDto
            {
                MaterialPuerto = material,
                TiposDeCalidad = listaTc,
                Documentos = documentos
            };
        }

        public void CrearProducto(RegistroProductoDto producto, string usuario)
        {
            var resultado = comandos.Ejecutar(new CrearProducto { Dto = producto, Usuario = usuario });
            if (resultado.HayErrores)
            {
                throw new Exception(resultado.Errores[""]);
            }
        }

        public void EditarProducto(RegistroProductoDto producto, string usuario)
        {
            var resultado = comandos.Ejecutar(new EditarProducto { Dto = producto, Usuario = usuario });
            if (resultado.HayErrores)
            {
                throw new Exception(resultado.Errores[""]);
            }
        }

        public void EliminarProducto(int id, string usuario)
        {
            var resultado = comandos.Ejecutar(new EliminarProducto { Id = id, Usuario = usuario });
            if (resultado.HayErrores)
            {
                throw new Exception(resultado.Errores[""]);
            }
        }

        #endregion ABM Producto
    }
}