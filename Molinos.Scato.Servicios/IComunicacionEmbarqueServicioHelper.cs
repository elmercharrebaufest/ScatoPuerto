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
    }
}
