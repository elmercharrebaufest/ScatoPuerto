using Molinos.Scato.Servicios.AFIPServicioConsultaComunicacionEmbarque;

namespace Molinos.Scato.Servicios.Impl
{
    public interface IConsultaComunicacionEmbarqueServicioHelper
    {
        ResultadoEjecucionOfResultadoEstadoProceso ConsultarEstadosCOEM(string identificadorCaratula);
        ResultadoEjecucionOfResultadoNoAbordoProceso ConsultarNoABordo(string identificadorCaratula);
        ResultadoEjecucionOfResultadoSolicitudProceso ConsultarSolicitudes(string identificadorCaratula);
    }
}