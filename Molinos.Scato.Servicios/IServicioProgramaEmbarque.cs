using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.ServiceModel;

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
        ListaPaginada<ProgramaEmbarqueDto> ListarProgramaDeEmbarque(Paginacion paginacion, DateTime? fecha = null, List<string> muelle = null, List<string> buque = null, List<string> producto = null);
        
        [OperationContract]
        ProgramaEmbarqueDto ListarDatosCombo();

        [OperationContract]
        IList<CalidadValorDto> listarCalidadValor();

        [OperationContract]
        IList<TipoDeCalidadDto> listarTipoDeCalidad();
        
        [OperationContract]
        NominacionDto ObtenerNominacion(int id);

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
        IList<ATAPuertoDto> listarATAPuerto();

        [OperationContract]
        IList<AgenciaMaritimaPuertoDto> listarAgenciaMaritimaPuerto();

        [OperationContract]
        bool ValidarCreacionNominacion(NominacionValidaDto nominacion);

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
        MailDto ObtenerDatosMailProgramaEmbarque(NominacionDto nominacion, string tipo);

        [OperationContract]
        IList<AuditoriaDto> ObtenerAuditoria(int nominacion_id);
        [OperationContract]
        void ActualizarDatosYEnviarMail(MailDto mail, string usuario);

        [OperationContract]
        List<Tuple<int, bool>> TieneAuditoria(int[] nominaciones_id);
    }
}
