using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
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
                var caratulaDB = Repositorio.Obtener<AfipCaratula>(comando.Dto.IdCaratula) ?? throw new Exception("No existe la caratula con el id " + comando.Dto.IdCaratula);
                if (caratulaDB.SolicitudesCierreCarga.Any(x => x.Estado == ((int)EstadosSolicitudesAFIP.Pendiente)))
                {
                    throw new Exception("Ya existe una solicitud pendiente de cierre de carga para esta carátula");
                }

                comando.Dto.IdentificadorCaratula = caratulaDB.IdentificadorCaratula;

                foreach (var coem in comando.Dto.Coems)
                {
                    var coemDb = caratulaDB.Coems.FirstOrDefault(c => c.Id == coem.IdCoem) ?? throw new Exception("No existe la coem con el id " + coem.IdCoem);
                    if (coemDb.AfipCoemEstado.Codigo != "AUTO")
                    {
                        throw new Exception("La COEM " + coemDb.IdentificadorCOEM + " no se encuentra en estado 'AUTO'");
                    }
                    coem.IdentificadorCoem = coemDb.IdentificadorCOEM;
                    foreach (var declaracion in coem.Declaraciones)
                    {
                        var declaracionDb = coemDb.MercaderiasSueltas.FirstOrDefault(m => m.IdentificadorDeclaracion == declaracion.IdentificadorDeclaracion) ?? throw new Exception("No existe la declaracion con el identificador " + declaracion.IdentificadorDeclaracion);
                        declaracionDb.Embalajes.First().CantidadReal = declaracion.CantidadReal; // Se guardan las cantidades reales embarcadas
                    }
                }

                var res = comunicacionEmbarqueServicioHelper.SolicitarCierreCargaGranel(comando.Dto).Body.SolicitarCierreCargaGranelResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }
                var identificadorCierre = cuerpoRespuesta.DescripcionAdicional.Split(' ')[1];
                caratulaDB.IdentificadorCierre = identificadorCierre;
                caratulaDB.Estado = EstadosCaratulaAFIP.CierreSolicitado;

                var solicitudCierre = new AfipSolicitudCierreCarga
                {
                    AfipCaratula = caratulaDB,
                    IdentificadorCierre = identificadorCierre,
                    FechaCreacion = DateTime.Now,
                    FechaActualizacion = DateTime.Now,
                    Estado = (int)EstadosSolicitudesAFIP.Pendiente
                };
                Repositorio.Agregar(solicitudCierre);
                this.Repositorio.GuardarCambios();
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
