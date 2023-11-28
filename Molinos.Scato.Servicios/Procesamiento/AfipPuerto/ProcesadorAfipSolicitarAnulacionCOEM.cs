using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento.AfipPuerto
{
    public class ProcesadorAfipSolicitarAnulacionCOEM : ProcesadorComando<AfipSolicitarAnulacionCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipSolicitarAnulacionCOEM(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipSolicitarAnulacionCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Id) ?? throw new Exception("No existe la COEM con el id expecificado");
                if (coemDB.AfipCoemEstado.Estado != EstadosCoemAFIP.Registrada && coemDB.AfipCoemEstado.Estado != EstadosCoemAFIP.Presentada)
                {
                    throw new Exception("La COEM debe estar en estado Registrada (REG) o Presentada (PRE) para poder solicitar anulación");
                }
                var res = comunicacionEmbarqueServicioHelper.SolicitarAnulacionCOEM(coemDB.IdentificadorCaratula, coemDB.IdentificadorCOEM).Body.SolicitarAnulacionCOEMResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al Solicitar Anulacion de COEM {0}", e);                
            }
            return resultado;
        }
    }
}
