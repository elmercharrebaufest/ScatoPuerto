using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios
{
    public interface IComunicacionEmbarqueServicioHelper
    {
        RegistrarCaratulaResponse RegistrarCaratula(AfipCaratulaDto afipCaratulaDto);
        RectificarCaratulaResponse RectificarCaratula(AfipCaratulaDto afipCaratulaDto);
        AnularCaratulaResponse AnularCaratula(string identificadorCaratula);
        SolicitarCambioBuqueResponse SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto, string identificadorCaratula);
        RegistrarCOEMResponse RegistrarCOEM(AfipCoemDto afipCoemDto);
        RectificarCOEMResponse RectificarCOEM(AfipCoemDto afipCoemDto);
        AnularCOEMResponse AnularCOEM(string identificadorCaratula, string identificadorCOEM);
        CerrarCOEMResponse CerrarCOEM(string identificadorCaratula, string identificadorCOEM);
        SolicitarAnulacionCOEMResponse SolicitarAnulacionCOEM(string identificadorCaratula, string identificadorCOEM);
        SolicitarCierreCargaGranelResponse SolicitarCierreCargaGranel(string identificadorCaratula, DateTime fechaZarpada, string numeroViaje, CoemGranel[] coems);
        SolicitarNoABordoResponse SolicitarNoAbordo(string identificadorCaratula, string identificadorCoem, Declaracion[] identificadoresDeclaracionesMercaderiaSuelta);
    }
}
