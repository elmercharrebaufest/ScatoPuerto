using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento.AfipPuerto
{
    public class ProcesadorAfipSolicitarCierreCargaGranel : ProcesadorComando<AfipSolicitarCierreCargaGranel>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipSolicitarCierreCargaGranel(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipSolicitarCierreCargaGranel comando)
        {
            var resultado = new ResultadoCrear();

            try
            {
                var caratulaDB = Repositorio.Obtener<AfipCaratula>(comando.Dto.IdCaratula) ?? throw new Exception("No existe la Caratula con el id especificado");

                var coemGranelList = comando.Dto.Coems.Select(idCoem =>
                {
                    var mercaderias = Repositorio
                        .Listar<AfipCoemMercaderiaSuelta>(x => x.AfipCoem.Id == idCoem)
                        .Select(mercaderia => new DeclaracionGranel
                        {
                            IdentificadorDeclaracion = mercaderia.IdentificadorDeclaracion,
                            FechaEmbarque = mercaderia.AfipCoem.AfipCaratula.FechaArribo,
                        })
                        .ToList();

                    var coem = Repositorio.Obtener<AfipCoem>(idCoem);

                    return new CoemGranel
                    {
                        IdentificadorCoem = coem.IdentificadorCOEM,
                        Declaraciones = mercaderias.ToArray(),                        
                    };
                }).ToList();                             

                var res = comunicacionEmbarqueServicioHelper.SolicitarCierreCargaGranel(caratulaDB.IdentificadorCaratula, caratulaDB.FechaZarpada, caratulaDB.NumeroViaje, coemGranelList.ToArray()).Body.SolicitarCierreCargaGranelResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }

                //QUE SE HACE CON EL IDENTIFICADOR ??
                var identificadorSolCierreCarga = cuerpoRespuesta.DescripcionAdicional.Split(' ')[1];
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error("Error al solicitar Cierre Carga Granel de COEM {0}", ex);
            }
            return resultado;
        }

    }
}
