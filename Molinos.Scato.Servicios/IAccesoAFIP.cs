using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios
{
    public interface IAccesoAFIP
    {
        string PathCertificado { get; }
        TicketAccesoAfip Obtener(string cuitRepresentado, Resultado resultado, string servicio);
    }
}
