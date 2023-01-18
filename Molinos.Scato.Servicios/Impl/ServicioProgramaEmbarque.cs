using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.DirectoryServices;
using System.Linq;
using System.Linq.Expressions;
using System.Web;

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
                return Listar<TipoDeContrato, TipoDeContratoDto>();
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
                return Listar<VaporInformacion, VaporInformacionDto>();
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
                return Listar<Destino, DestinoDto>();
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
                return Listar<Exportador, ExportadorDto>();
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
                return Listar<CoordinadorPuerto, CoordinadorPuertoDto>();
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

        public IList<ATAPuertoDto> listarATAPuerto()
        {
            try
            {
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
                                                                      x.Id != nominacion.Id);
            if (listaNominaciones.Count > 0) bValidacion = false;
            return bValidacion;
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
                var excluidas = repositorio.Listar<NotificacionExcluidos>().ToList();
                if (notificaciones != null && notificaciones.Count > 0)
                {
                    foreach (NotificacionProgramaDeEmbarque notificacion in notificaciones.ToList())
                    {
                        //Elimino de la base todas las anteriores a 10 días desde su creación.
                        if (notificacion.Fecha < DateTime.Now.AddDays(-10))
                        {
                            //también elimino las excluidas para que no explota la base.
                            repositorio.RemoverTodos<NotificacionExcluidos>(excluidas.Where(x => x.NotificacionProgramaDeEmbarque.Id == notificacion.Id));
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

                return notificacionesDto;
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
                copia.Add(tipoDeMail == "Surveyor" ? nominacion.NominacionDatoTecnico.Surveyor.Mail : tipoDeMail == "Fumigador" ?
                    nominacion.NominacionDetalleIntervencion.CompaniaDeFumigacion.Mail : "");
                var mail = new MailDto
                {
                    Destinatarios = repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "PlanillaProgramaEmbarque").Direcciones.Split(';').ToList(),
                    Copia = copia,
                };
                var body = "<div style=\"font-family: Arial, Helvetica, sans-serif;\"> Estimados, por favor notar que fueron nominados para actuar en la carga del buque de referencia. <br/> <br/>";

                body += $"<table style=\"font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%; background-color: lightgrey;\"> " +
                        $" <tr>" +
                        $" <td style=\"padding: 5px;\"> <strong>PRODUCTO</strong>" +
                        $" </td>" +
                        $"<td style=\"padding: 5px;\"> {nominacion.NominacionDatoTecnico.MaterialPuerto.DescripcionCortaIngles} ({nominacion.NominacionDatoTecnico.MaterialPuerto.Descripcion.Trim()})" +
                        $" </td>";
                body += $" <td style=\"padding: 5px;\"> <strong>NOMBRE BUQUE</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> { (nominacion.NominacionDatoTecnico?.VaporInformacion != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.VaporInformacion.NombreBuque) ? nominacion.NominacionDatoTecnico?.VaporInformacion?.NombreBuque : "-") } " +
                        $" </td>" +
                        $" </tr>" +
                        $" <tr>" +
                        $" <td style=\"padding: 5px;\"><strong>MUELLE DE CARGA</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\">{(nominacion.NominacionDatoTecnico?.MuelleDeCarga != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.MuelleDeCarga?.Descripcion) ? nominacion.NominacionDatoTecnico?.MuelleDeCarga?.Descripcion : "-") }" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"><strong>BANDERA</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\">{(nominacion.NominacionDatoTecnico?.VaporInformacion != null && nominacion.NominacionDatoTecnico?.VaporInformacion?.Bandera != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.VaporInformacion.Bandera.Nombre) ? nominacion.NominacionDatoTecnico?.VaporInformacion?.Bandera.Nombre : "-")}" +
                        $" </td>" +
                        $" </tr>" +
                        $" <tr>" +
                        $" <td style=\"padding: 5px;\"><strong>LOADING RATE</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\">{(nominacion.NominacionDatoTecnico?.TasaDeCargaValor != null ? nominacion.NominacionDatoTecnico?.TasaDeCargaValor : 0)} {(nominacion.NominacionDatoTecnico?.TasaDeCarga != null && nominacion.NominacionDatoTecnico?.TasaDeCarga?.Descripcion != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.TasaDeCarga?.Descripcion) ? nominacion.NominacionDatoTecnico?.TasaDeCarga?.Descripcion : " - ") }" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"><strong>ATA</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\">{(nominacion.NominacionDatoTecnico?.ATAPuerto != null && nominacion.NominacionDatoTecnico?.ATAPuerto?.Nombre != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.ATAPuerto?.Nombre) ? nominacion.NominacionDatoTecnico?.ATAPuerto?.Nombre : "-")}" +
                        $" </td>" +
                        $" </tr>" +
                        $" <tr>" +
                        $" <td style=\"padding: 5px;\"><strong>CLIENTE</strong> " +
                        $" </td>";
                if (nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Count > 0)
                {
                    body += $"<td style=\"padding: 5px;\">{string.Join(", ", nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Select(x => x.CoordinadorPuerto.Nombre)) }</td>";
                }
                else
                {
                    body += $"<td style=\"padding: 5px;\"> - </td> ";
                }
                body += $" </tr>" +
                        $"</table>";

                //Calidad
                body += $"<br />";
                body += $"<label><strong>CALIDAD</strong></label>";
                body += $"<table style=\"font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%;\">" +
                        $" <tr>" +
                        $"<thead> <td style=\"border: 1px solid #ddd;padding: 8px; background-color: #ddd;\"><strong> { ((nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad.Count > 0) ? nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad.FirstOrDefault().CalidadValor?.TipoDeCalidad?.Descripcion.Trim() : "-")} </strong> </td><thead>";
                if (nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad.Count > 0)
                {
                    foreach (var item in nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad)
                    {                       
                        body += $"<td style=\"border: 1px solid #ddd;padding: 8px;\"><strong> {item.CalidadValor.Parametro} </strong> {item.CalidadValor.Valor} - </td>";
                        body += $"</tr>";
                }

                }
                else
                {
                    body += $" - </td>";
                }
                body += $" </tr>" +
                        $"</table>";

                //Recibo
                body += $"<br/>";
                if (nominacion.NominacionRecibo != null && nominacion.NominacionRecibo.Count > 0)
                {
                    body += $"<label><strong>RECIBO</strong></label>";
                    body += $"<table style=\"font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%;\">";

                    foreach (var item in nominacion.NominacionRecibo)
                    {
                        body += $" <tr>";
                        body += $"<td style=\"border: 1px solid #ddd;padding: 8px;\"> <strong> {item.Exportador.Nombre}</strong></td>";
                        body += $"<td style=\"border: 1px solid #ddd;padding: 8px;\"><strong>CANTIDAD (Tn)</strong>:   {item.Cantidad.ToString("n0")} </br>";
                        body += $"<strong>FORMATO/UNIDAD</strong>:  {item.Formato }/{item.Unidad} </br>";
                        body += $"<strong>AJUSTE</strong>:  {item.Ajuste } </br>";
                        body += $"<strong>LOADING PORT</strong>:  {item.PuertoDeCarga } </br>";
                        body += $"<strong>DISCHARGE PORT</strong>:  {item.PuertoDeCarga } </br>";
                        body += $"<strong>DESCRIPTION OF GOODS</strong>:  {item.DescripcionesBienes} </td>";
                        body += $"</tr>";
                    }

                    body += $"</table>";
                }

            body += $"<br>";
            body += $"<table style=\"font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%;background-color: lightgrey;\"> " +
                        $" <tr>" +
                        $" <td style=\"padding: 5px;\"> <strong>CANTIDAD (Tn)</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> { nominacion.NominacionDatoTecnico?.CantidadTotal.ToString("n0") }" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> <strong>DEM/DES RATE</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> u$ { nominacion.NominacionDatoTecnico?.DEM.ToString("n0")} / { nominacion.NominacionDatoTecnico?.DES.ToString("n0")}" +
                        $" </td>" +
                        $" </tr>" +
                        $" <tr>" +
                        $" <tr>" +
                        $" <td style=\"padding: 5px;\"> <strong>TOLERANCIA</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> { nominacion.NominacionDatoTecnico?.Tolerancia }% +/- " +
                        $" </td>" +
                          $" <td style=\"padding: 5px;\"> <strong>AGENCIA MARITIMA</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> {(nominacion.NominacionDatoTecnico?.AgenciaMaritimaPuerto != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.AgenciaMaritimaPuerto?.Nombre) ? nominacion.NominacionDatoTecnico?.AgenciaMaritimaPuerto?.Nombre : "-") }" +
                        $" </td>" +
                        $" </tr>" +
                        $" <tr>" +
                        $" <td style=\"padding: 5px;\"> <strong>ETA RECALADA</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> { (nominacion.NominacionDatoTecnico?.ETARecalada != null ? nominacion.NominacionDatoTecnico?.ETARecalada.Value.ToString("dd-MM-yyyy") : "-") }" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> <strong>OBLIGACION DE CARGA</strong>" +
                        $" </td>" +
                        $" <td style=\"padding: 5px;\"> {(nominacion.NominacionDatoTecnico?.ObligacionDeCarga != null ? nominacion.NominacionDatoTecnico?.ObligacionDeCarga.Value.ToString("dd-MM-yyyy") : "-") }" +
                        $" </td>" +
                        $" </tr>" +
                        $" <tr>" +
                        $" <td style=\"padding: 5px;\"> <strong>CARGADOR</strong>" +
                        $" </td>";
                if (nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador.Count > 0)
                {
                    body += $"<td style=\"padding: 5px;\">{string.Join(", ", nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador.Select(x => x.Exportador.Nombre)) }</td>";
                }
                else
                {
                    body += $"<td style=\"padding: 5px;\"> - </td> ";
                };
                body += $" <td style=\"padding: 5px;\"> <strong>DESTINO</strong>" +
                        $" </td>";
                if (nominacion.NominacionDatoTecnico.NominacionDatoTecnicoDestino != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoDestino.Count > 0)
                {
                    body += $"<td style=\"padding: 5px;\">{string.Join(", ", nominacion.NominacionDatoTecnico.NominacionDatoTecnicoDestino.Select(x => x.Destino.Nombre)) }</td>";
                }
                else
                {
                    body += $"<td > - </td> ";
                };
                body += $" </tr>" +
                      $" <tr>" +
                      $" <td style=\"padding: 5px;\"> <strong>TIPO FUMIGACIÓN</strong>" +
                      $" </td>" +
                      $" <td style=\"padding: 5px;\"> {(nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion?.TipoDeFumigacion != null && !string.IsNullOrEmpty(nominacion.NominacionDetalleIntervencion?.TipoDeFumigacion?.Descripcion) ? nominacion.NominacionDetalleIntervencion?.TipoDeFumigacion?.Descripcion : "-") }" +
                      $" </td>" +
                      $" <td style=\"padding: 5px;\"> <strong>ESTIBADO Y TRIMADO</strong>" +
                      $" </td>" +
                      $" <td style=\"padding: 5px;\"> { ((nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion.EstibadorYTrimado == true) ? "SI" : "N/A")}" +
                      $" </td>" +
                      $" </tr>" +
                      $" <tr>" +
                      $" <td style=\"padding: 5px;\"> <strong>SURVEYOR</strong>" +
                      $" </td>" +
                      $" <td style=\"padding: 5px;\"> {(nominacion.NominacionDatoTecnico?.Surveyor != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.Surveyor?.Descripcion) ? nominacion.NominacionDatoTecnico?.Surveyor?.Descripcion : "-") }" +
                      $" </td>" +
                      $" </tr>";
                body += $"</table>";
            //Senasa
            body += $"<br/>";
                if (nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion.Senasa != null && nominacion.NominacionDetalleIntervencion.Senasa.Count > 0)
                {
                    body += $"<label><strong>SENASA</strong></label>";
                    body += $" <table style=\"font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%;\">" +
                                $"<thead>" +
                                $"<tr style=\"background-color: #ddd; color: black; text-align: center;border: 1px solid #ddd;\">" +
                                $"<th>Exportador</th>" +
                                $"<th>Corresponde SENASA</th>" +
                                $"<th>IP (Pedido de Importación)</th>" +
                                $"<th>Muestras oficiales</th>" +
                                $"</tr>" +
                                $"</thead>";
                    body += $"<tbody>";
                    foreach (var item in nominacion.NominacionDetalleIntervencion.Senasa)
                    {
                        body += $"<tr style=\"border: text-align:center;\">" +
                                  $"<td style=\"border: 1px solid #ddd;padding: 5px;\"> {item.Exportador.Nombre} </td>" +
                                  $"<td style=\"border: 1px solid #ddd;padding: 5px;\"> { (item.TieneSenasa ? "SI" : "NO") } </td>" +
                                  $"<td style=\"border: 1px solid #ddd;padding: 5px;\"> { (item.IP ? "SI" : "NO") } </td>" +
                                  $"<td style=\"border: 1px solid #ddd;padding: 5px;\">{ (item.MuestraOficial ? "SI" : "NO") } </td> " +
                                  $"</tr>";
                    }
                    body += $"</tbody>" +
                           $"</table></div>";
                }
                mail.Body = body;
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
        public void ActualizarDatosYEnviarMail(MailDto mail, string usuario)
        {
            try
            {
                var nominacion = repositorio.Obtener<Nominacion>(x => x.Id == mail.Id);
                if(mail.TipoDeMail == "Surveyor")
                {
                    nominacion.EnviadoSurveyor = true;
                }else if (mail.TipoDeMail == "Fumigador")
                {
                    nominacion.EnviadoFumigador = true;
                }
                else
                {
                    nominacion.EnviadoOtros = true;
                }
                repositorio.GuardarCambios();
                EnviarMail(mail, usuario);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void EnviarMail(MailDto mail, string usuario)
        {
           var mailUsuarioCreador = ObtenerMailDeActiveDirectory(usuario);
            if (!string.IsNullOrEmpty(mailUsuarioCreador))
            {
                mail.Copia.Add(mailUsuarioCreador);
            }    
            mail.Copia.RemoveAll(item => item == null);
            mail.Destinatarios.RemoveAll(item => item == null);
            comandos.Ejecutar(new EnvioMail
            {
                Cuerpo = mail.Body.Replace("\n", "<br/>").Replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
                       .Replace("\f\f", "</b>").Replace("\f", "<b>").Replace("\0\0", "</u>").Replace("\0", "<u>"),
                Destinatarios = mail.Destinatarios,
                Titulo = mail.Titulo,
                Copia = mail.Copia,
                AttachmentName = null,
            });
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
            search.Filter = String.Format("(sAMAccountName={0})", userName);
            search.PropertiesToLoad.Add("givenName");   // first name
            search.PropertiesToLoad.Add("sn");          // last name
            search.PropertiesToLoad.Add("mail");        // smtp mail address

            // perform the search
            SearchResult result = search.FindOne();
            try
            {
                return result.Properties.Contains("mail") ? result.Properties["mail"][0].ToString() : result.Properties["userPrincipalName"][0].ToString();
            }
            catch
            {
                log.Error($"No se encontró el mail en AD para el usuario {userName}");
            }
            return string.Empty;
        }
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


            #endregion        
    } 
}