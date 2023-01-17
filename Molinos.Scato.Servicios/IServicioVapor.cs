using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Filtros;
using Molinos.Scato.Dominio.Seguridad;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioVapor
    {

        [OperationContract]
        ListaPaginada<VaporInformacionDto> ListarVaporInformacion(Paginacion paginacion, string buque = null, string imo = null, List<string> tipoBuque = null, List<string> bandera = null);


    }
}
