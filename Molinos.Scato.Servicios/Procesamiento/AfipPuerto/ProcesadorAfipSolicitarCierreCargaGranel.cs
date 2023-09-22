using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
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
                var caratulaDB = Repositorio.Obtener<AfipCaratula>(comando.IdentificadorCaratula);
                IList<CoemGranel> coems = new List<CoemGranel>();

                if (caratulaDB == null)
                {
                    throw new Exception("No existe la Caratula con el id especificado");
                }

                var coemGranelList = comando.Coems.Select(coem =>
                {
                    var mercaderias = Repositorio
                        .Listar<AfipCoemMercaderiaSuelta>(x => x.AfipCoem.Id == coem.Id)
                        .Select(mercaderia => new DeclaracionGranel
                        {
                            IdentificadorDeclaracion = mercaderia.IdentificadorDeclaracion,
                            FechaEmbarque = mercaderia.AfipCoem.AfipCaratula.FechaArribo
                        })
                        .ToList();

                    return new CoemGranel
                    {
                        IdentificadorCoem = comando.IdentificadorCoem,
                        Declaraciones = mercaderias.ToArray()
                    };
                }).ToList();
              
                //foreach (var coem in comando.Coems)
                //{
                //    var mercaderias = Repositorio.Listar<AfipCoemMercaderiaSuelta>(x => x.AfipCoem.Id == coem.Id);
                //    var declaraciones = new List<DeclaracionGranel>();
                //    foreach (var mercaderia in mercaderias)
                //    {
                //        DeclaracionGranel declaracion = new DeclaracionGranel
                //        {
                //            IdentificadorDeclaracion = mercaderia.IdentificadorDeclaracion,
                //            FechaEmbarque = mercaderia.AfipCoem.AfipCaratula.FechaArribo                            
                //        };

                //        declaraciones.Add(declaracion);                        
                //    }

                //    CoemGranel coemGranel = new CoemGranel
                //    {
                //        IdentificadorCoem = comando.IdentificadorCoem,
                //        Declaraciones = declaraciones.ToArray(),                   
                //    };
                //}

                var res = comunicacionEmbarqueServicioHelper.SolicitarCierreCargaGranel(caratulaDB.IdentificadorCaratula, caratulaDB.FechaZarpada, caratulaDB.NumeroViaje, coemGranelList);
                var cuerpoRespuesta = res.Body.SolicitarCierreCargaGranelResult.ListaErrores[0];
                if (cuerpoRespuesta.Codigo != 0)
                {
                    throw new Exception(String.Format("Ocurrió un error al Solicitar Cierre carga granel: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                }
            }
            catch (Exception)
            {

                throw;
            }
        }

    }
}
