using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioCargaOtrosMuelles
    {
        [OperationContract]
        OtroMuelleCargaDto ObtenerCarga(int embarqueId);

        [OperationContract]
        OtroMuelleNominacionDto ObtenerDatosNominacion(int embarqueId);

        [OperationContract]
        void GuardarCarga(OtroMuelleCargaDto otroMuelleCarga, int embarqueId, string usuario);

        [OperationContract]
        void GuardarDetalleCarga(OtroMuelleCargaDetalleDto otroMuelleCargaDetalle, int embarqueId, string usuario);

        [OperationContract]
        void EliminarDetalleCarga(int otroMuelleCargaDetalleId, string usuario);

        [OperationContract]
        bool ValidarHorarios(OtroMuelleCargaDetalleDto detalle, int embarqueId);
    }
}
