using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Destino;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.ServiceModel;
using static Molinos.Scato.Servicios.Impl.ServicioProgramaEmbarque;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioProgramaEmbarque
    {
        [OperationContract]
        IList<TipoDeContratoDto> listarTipoDeContrato();

        [OperationContract]
        IList<SurveyorDto> listarSurveyor();

        [OperationContract]
        IList<TasaDeCargaDto> listarTasaDeCarga();

        [OperationContract]
        IList<MuelleDeCargaDto> listarMuelleDeCarga();

        [OperationContract]
        IList<MuelleDto> ListarOtrosMuelles();

        [OperationContract]
        ListaPaginada<ProgramaEmbarqueDto> ListarProgramaDeEmbarque(Paginacion paginacion, DateTime? fecha = null, List<string> muelle = null, List<string> buque = null, List<string> producto = null, bool? zarpo = null);

        [OperationContract]
        ProgramaEmbarqueDto ListarDatosCombo();

        [OperationContract]
        IList<CalidadValorDto> listarCalidadValor();

        [OperationContract]
        IList<TipoDeCalidadDto> listarTipoDeCalidad();

        [OperationContract]
        NominacionDto ObtenerNominacion(int id);

        [OperationContract]
        int ObtenerEmbarqueIdNominacion(int nominacionId);

        [OperationContract]
        bool PuedeCambiarMuelle(int nominacionId);

        [OperationContract]
        IList<NominacionReciboDto> ObtenerNominacionRecibos(int nominacion_id);

        [OperationContract]
        void GuardarNominacionRecibo(List<NominacionReciboDto> nominacionRecibo, int nominacion_id);

        [OperationContract]
        IList<VaporInformacionDto> listarVaporInformacion();

        [OperationContract]
        IList<CompaniaDeFumigacionDto> ListarCompaniaDeFumigacion();

        [OperationContract]
        IList<TipoDeFumigacionDto> ListarTipoDeFumigacion();

        [OperationContract]
        IList<MaterialPuertoDto> listarMaterialPuerto();

        [OperationContract]
        IList<DestinoDto> listarDestino();

        [OperationContract]
        IList<ExportadorDto> listarExportador();

        [OperationContract]
        IList<CoordinadorPuertoDto> listarCoordinadorPuerto();

        [OperationContract]
        IList<BanderaDto> listarBandera();

        [OperationContract]
        IList<ATAPuertoDto> listarATAPuerto(bool soloActivas = false);

        [OperationContract]
        IList<AgenciaMaritimaPuertoDto> listarAgenciaMaritimaPuerto();

        [OperationContract]
        bool ValidarCreacionNominacion(NominacionValidaDto nominacion);

        [OperationContract]
        bool ValidarPuedeCambiarBuque(int embarqueId);

        [OperationContract]
        bool CrearSurveyor(SurveyorDto surveyor);

        [OperationContract]
        bool CrearTipoDeFumigacion(TipoDeFumigacionDto tipoDeFumigacion);

        [OperationContract]
        bool CrearCompaniaDeFumigacion(CompaniaDeFumigacionDto companiaDeFumigacion);

        [OperationContract]
        NominacionDto GuardarNominacion(NominacionDto nominacion);

        [OperationContract]
        void EliminarNominacion(int nominacion_id);

        [OperationContract]
        void EliminarNotificacion(int notificacion_id, string username);

        [OperationContract]
        IList<NotificacionProgramaDeEmbarqueDto> ObtenerNotificaciones(string nombreUsuario);

        [OperationContract]
        MailDto ObtenerDatosMailProgramaEmbarque(NominacionDto nominacion, string tipoDeMail);

        [OperationContract]
        IList<AuditoriaDto> ObtenerAuditoria(int nominacion_id);

        [OperationContract]
        void ActualizarDatosYEnviarMail(MailDto mail);

        [OperationContract]
        List<Tuple<int, bool>> TieneAuditoria(int[] nominaciones_id);

        [OperationContract]
        IList<VaporInformacionDto> ListarBuquesNominacion();

        [OperationContract]
        IList<NominacionLineUpDto> ListarNominacionPorBuque(int vaporInformacion_Id);

        [OperationContract]
        ProgramaEmbarqueValidacionLineUpDto ObtenerEmbarque(int materialPuerto_Id, int muelleDeCarga_Id, int vapor_Id);

        [OperationContract]
        IList<EmbarqueDto> ObtenerEmbarquePorVapor(int materialPuerto_Id, int muelleDeCarga_Id, int vapor_Id);

        [OperationContract]
        void AsociarEmbarquePorNominacionEnviada(int nominacion_Id, int embarque_Id, string observacion);

        [OperationContract]
        void AgregarMaterialesPorNominacionEnviada(int nominacion_Id, int embarque_Id);

        [OperationContract]
        bool EliminarMaterialPorCambioDeMuelle(int nominacionId, int embarqueId);

        [OperationContract]
        void ProcesarNotificacion(TipoNotificacion tipoNotificacion, Embarque embarque = null, EmbarqueDto embarqueDto = null, NominacionDto nominacionDto = null);

        [OperationContract]
        void AgregarNotificacion(NotificacionProgramaDeEmbarque notificacionProgramaDeEmbarque);

        [OperationContract]
        IList<NominacionDto> ListarNominacionesExcel();

        [OperationContract]
        void EnviarMailNominacionesExcel(byte[] archivo);

        #region Agencias Maritimas ATA

        [OperationContract]
        ListaPaginada<AgenciaMaritimaATADto> ListarAgenciasATA(Paginacion paginacion, string nombre, string cuit, int tipo);

        [OperationContract]
        List<AgenciaMaritimaATADto> ListarAgenciasATASinPaginar(string nombre, string cuit, int tipo);

        [OperationContract]
        ATAPuertoDto ObtenerATAPuerto(int id);

        [OperationContract]
        AgenciaMaritimaPuertoDto ObtenerAgenciaMaritimaPuerto(int id);

        [OperationContract]
        void CrearAgenciaMaritimaATA(CrearAgenciaMaritimaATADto agenciaATA, string usuario);

        [OperationContract]
        void ModificarAgenciaMaritimaATA(ModificarAgenciaMaritimaATADto agencia, string usuario);

        [OperationContract]
        void EliminarAgenciaMaritimaATA(int id, int tipo, string usuario);

        [OperationContract]
        AgenciaMaritimaPuertoDto ConsultarAgenciaMaritimaPorCuitEnSap(string cuit);

        #endregion Agencias Maritimas ATA

        #region Destinos

        [OperationContract]
        ListaPaginada<DestinoDto> ListarDestinos(string nombre, int pagina = 0, int itemsPorPagina = 0);

        [OperationContract]
        void CrearDestino(AltaEdicionDestinoDto destino, string usuario);

        [OperationContract]
        void ModificarDestino(AltaEdicionDestinoDto destino, string usuario);

        [OperationContract]
        void EliminarDestino(int id, string usuario);

        #endregion Destinos

        #region ABM Exportadores

        [OperationContract]
        ListaPaginada<ExportadorDto> ListarExportadoresPaginado(Paginacion paginacion, string nombre);

        [OperationContract]
        IList<ExportadorDto> ListarExportadores(string nombre);

        [OperationContract]
        void CrearExportador(ExportadorDto exportador, string usuario);

        [OperationContract]
        ExportadorDto ObtenerExportador(int id);

        [OperationContract]
        void EditarExportador(ExportadorDto exportador, string usuario);

        [OperationContract]
        void EliminarExportador(int id, string usuario);

        [OperationContract]
        ExportadorDto ConsultarExportadorPorCuitEnSap(string cuit);

        #endregion ABM Exportadores

        [OperationContract]
        void CrearNominacionFAS(int embarqueId, List<NominacionReciboDto> recibos);

        #region ABM Productos

        [OperationContract]
        ListaPaginada<MaterialPuertoDto> ListarProductosPaginado(string nombre, int pagina, int itemsPorPagina, List<string> listTipoDeProducto = null);

        [OperationContract]
        IList<ProductoDto> ListarProductosConCalidades(string nombre);

        [OperationContract]
        RegistroProductoDto ObtenerProducto(int id);

        [OperationContract]
        void CrearProducto(RegistroProductoDto producto, string usuario);

        [OperationContract]
        void EditarProducto(RegistroProductoDto producto, string usuario);

        [OperationContract]
        void EliminarProducto(int id, string usuario);

		#endregion ABM Productos

		#region Llamada SAP
		[OperationContract]
		void EnviarEmbarqueASAP(int embarqueId, string usuario);

		[OperationContract]
		void ValidarEnviarOperacionSAP(int embarqueId, string usuario);
		#endregion
	}
}