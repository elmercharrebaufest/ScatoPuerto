using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioVapor
    {
        [OperationContract]
        ListaPaginada<VaporInformacionDto> ListarVaporInformacion(Paginacion paginacion, string buque = null, string imo = null, List<string> tipoBuque = null, string bandera = null);

        [OperationContract]
        List<VaporInformacionDto> DevolverHistoricoVapor(int id);

        [OperationContract]
        string ValidarBuque(string bandera, string nombreBuque, string IMO, int? id);

        [OperationContract]
        void DeshabilitarVapor(VaporDto vapor, string usuario);

        [OperationContract]
        ArchivoDto ObtenerShipParticular(int id);

        [OperationContract]
        Resultado ReenviarVaporASap(int vaporId, string usuario);
    }
}