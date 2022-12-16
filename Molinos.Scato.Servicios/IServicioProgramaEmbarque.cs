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
    public interface IServicioProgramaEmbarque
    {
        [OperationContract]
        ListaPaginada<ProgramaEmbarqueDto> ListarProgramaDeEmbarque(Paginacion paginacion, DateTime? fecha = null, List<string> muelle = null, List<string> buque = null, List<string> producto = null);
        [OperationContract]
        ProgramaEmbarqueDto ListarDatosCombo();
    }
}
