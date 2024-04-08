using Molinos.Scato.Dominio.Consultas;
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
    public interface IServicioClientes
    {
        [OperationContract]
        ListaPaginada<CoordinadorPuertoDto> ListarClientesPuerto(Paginacion paginacion, string nombre = null);
        
        [OperationContract]
        void GuardarCliente(CoordinadorPuertoDto clienteDto, string usuario);

        [OperationContract]
        CoordinadorPuertoDto ObtenerCliente(int id);

        [OperationContract]
        void DeshabilitarCliente(CoordinadorPuertoDto clienteDto, string usuario);

    }
}
