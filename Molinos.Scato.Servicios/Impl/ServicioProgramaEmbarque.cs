using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Exportador;
using Molinos.Scato.Dominio.Comandos.Exportadores;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.DirectoryServices;
using System.IO;
using System.Linq;
using System.Linq.Expressions;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioProgramaEmbarque : IServicioProgramaEmbarque
    {
        private readonly IRepositorio repositorio;
        private readonly IConversor conversor;
        private readonly ILogger log;
        private readonly IServicioComandos comandos;

        public ServicioProgramaEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioComandos comandos)
        {
            this.repositorio = repositorio;
            this.conversor = conversor;
            this.log = log;
            this.comandos = comandos;
        }

        public ListaPaginada<ProgramaEmbarqueDto> ListarProgramaDeEmbarque(Paginacion paginacion, DateTime? fecha = null, List<string> muelle = null, List<string> buque = null, List<string> producto = null)
        {
            var fechaHasta = fecha.HasValue ? new DateTime(fecha.Value.Year, fecha.Value.Month, DateTime.DaysInMonth(fecha.Value.Year, fecha.Value.Month)) : (DateTime?)null;
            return repositorio.ListarConsultaPaginada(new ListarProgramaEmbarqueConsulta(paginacion, fecha, buque, muelle, producto));
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
                var nominacion = Obtener<Nominacion, NominacionDto>(id);
                if (nominacion != null)
                {
                    if (nominacion.Embarque != null)
                    {
                        if (nominacion.Embarque.Ubicacion == 2)
                            nominacion.EnMuelleDeCarga = true;
                    }
                    nominacion.Embarque = null;
                }
                return nominacion;
            }
            catch (Exception ex)
            {
                throw ex;
            }
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
                return Listar<MaterialPuerto, MaterialPuertoDto>(x => x.DescripcionCorta != null);
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

        public IList<ATAPuertoDto> listarATAPuerto(bool soloActivas = false)
        {
            try
            {
                if (soloActivas)
                {
                    return Listar<ATAPuerto, ATAPuertoDto>(ata => ata.Activa);
                }
                return Listar<ATAPuerto, ATAPuertoDto>();
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
                return Listar<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>();
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

        // No se puede cambiar el buque si se tienen cargas asociadas
        public bool ValidarPuedeCambiarBuque(int nominacionId)
        {
            var embarque = repositorio.Obtener<Nominacion>(nominacionId).Embarque;
            if (embarque == null)
            {
                return true;
            }
            var lineup = repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarque.Id);
            return !(lineup.ModuloDeCarga != null && lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos != null && lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.Count > 0);
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
            if (tipoDeMail == "Surveyor" && nominacion.NominacionDatoTecnico!=null && nominacion.NominacionDatoTecnico.Surveyor != null)
                campoMail = nominacion.NominacionDatoTecnico.Surveyor.Mail;
            else if (tipoDeMail == "Fumigador" && nominacion.NominacionDetalleIntervencion!=null && nominacion.NominacionDetalleIntervencion.CompaniaDeFumigacion != null)
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

        #endregion Agencias Maritimas ATA

        #region Destinos

        public ListaPaginada<DestinoDto> ListarDestinos(string nombre, int pagina = 0, int itemsPorPagina = 0)
        {
            IQueryable<Destino> query = repositorio.Incluir<Destino>()
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

        public void CrearDestino(string nombre, string usuario)
        {
            var res = comandos.Ejecutar(new CrearDestinoPuerto { Nombre = nombre, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void ModificarDestino(DestinoDto destino, string usuario)
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

        #endregion ABM Exportadores/Cargadores

        public void CrearNominacionFAS(int embarqueId, List<NominacionReciboDto> recibos)
        {
            var resultado = comandos.Ejecutar(new CrearEmbarqueFAS { EmbarqueId = embarqueId, Recibos = recibos });
            if (resultado.HayErrores)
            {
                throw new Exception(resultado.Errores[""]);
            }
        }
    }
}