using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipSolicitarCambioBuque : ProcesadorComando<AfipSolicitarCambioBuque>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper { get; set; }
        public ProcesadorAfipSolicitarCambioBuque(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipSolicitarCambioBuque comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                if (comando.Dto == null) { throw new Exception("Los datos recibidos son nulos"); }
                var caratulaDb = Repositorio.Obtener<AfipCaratula>(comando.Dto.CaratulaId) ?? throw new Exception("No se ha podido encontrar la carátula indicada");
                if (caratulaDb.SolicitudesCambioBuque.Any(x => x.Estado == ((int)EstadosSolicitudesAFIP.Pendiente)))
                {
                    throw new Exception("Ya existe una solicitud pendiente de cambio de buque para esta carátula");
                }

                var res = this.comunicacionEmbarqueServicioHelper.SolicitarCambioBuque(comando.Dto, caratulaDb.IdentificadorCaratula);
                var cuerpoRespuesta = res.Body.SolicitarCambioBuqueResult.ListaErrores[0];
                if (cuerpoRespuesta.Codigo != 0)
                {
                    throw new Exception(String.Format("Ocurrió un error al solicitar el cambio de buque: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                }

                var solicitudDb = new AfipSolicitudCambioBuque
                {
                    AfipCaratula = caratulaDb,
                    IdentificadorBuque = comando.Dto.IdentificadorBuque,
                    NombreMedioTransporte = comando.Dto.NombreMedioTransporte,
                    Estado = (int)EstadosSolicitudesAFIP.Pendiente,
                    FechaCreacion = DateTime.Now,
                    FechaActualizacion = DateTime.Now
                };
                Repositorio.Agregar(solicitudDb);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al solicitar cambio de buque {0}", e.StackTrace);
            }
            return resultado;
        }
    }
}
