using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
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
    public class ProcesadorAfipSolicitarNoAbordo : ProcesadorComando<AfipSolicitarNoAbordo>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipSolicitarNoAbordo(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipSolicitarNoAbordo comando)
        {
            var resultado = new ResultadoCrear();

            try
            {
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Dto.IdCoem) ?? throw new Exception("No existe la COEM con el id especificado");
                var motivoDb = Repositorio.Obtener<AfipMotivoNoABordo>(x => x.Codigo == comando.Dto.CodigoMotivo) ?? throw new Exception("No se ha encontrado el motivo seleccionado");

                if (coemDB.AfipSolicitudesNoABordo.Any(s => s.Estado == (int)EstadosSolicitudesAFIP.Pendiente))
                {
                    throw new Exception("Ya existe una solicitud de 'No a bordo' pendiente para esta COEM");
                }

                var identificadorCaratula = coemDB.AfipCaratula.IdentificadorCaratula;
                var declaracionesDB = coemDB.MercaderiasSueltas.Where(m => comando.Dto.Declaraciones.Contains(m.IdentificadorDeclaracion)).ToList();

                if (declaracionesDB.Any(d => d.NoABordo))
                {
                    throw new Exception("Ya se ha declarado 'No a bordo' para una o más declaraciones seleccionadas");
                }

                var declaraciones = this.Conversor.Convertir<IList<AfipCoemMercaderiaSuelta>, IList<Declaracion>>(declaracionesDB).ToArray();
                var codigoMotivo = comando.Dto.CodigoMotivo;
                var descripcionMotivo = comando.Dto.DescripcionMotivo;

                //var res = comunicacionEmbarqueServicioHelper.SolicitarNoAbordo(identificadorCaratula, coemDB.IdentificadorCOEM, declaraciones, codigoMotivo, descripcionMotivo).Body.SolicitarNoABordoResult;
                //var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                //if (cuerpoRespuesta == null)
                //{
                //    StringBuilder sb = new StringBuilder();
                //    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                //    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                //    throw new Exception(sb.ToString());
                //}

                //var identificadorSolicitud = cuerpoRespuesta.DescripcionAdicional.Split(' ')[1];
                var identificadorSolicitud = "NB" + DateTime.Now.ToString("yyyyMMddhhmmss");
                var declaracionesSolicitud = declaracionesDB.Select(d => new AfipSolicitudNoABordoDeclaracion { AfipCoemMercaderiaSuelta = d }).ToList();
                var solicitudDB = new AfipSolicitudNoABordo
                {
                    IdentificadorSolicitud = identificadorSolicitud,
                    AfipCoem = coemDB,
                    AfipMotivoNoABordo = motivoDb,
                    AfipSolicitudNoABordoDeclaraciones = declaracionesSolicitud,
                    DescripcionMotivo = descripcionMotivo,
                    Estado = (int)EstadosSolicitudesAFIP.Pendiente,
                    FechaCreacion = DateTime.Now,
                    FechaActualizacion = DateTime.Now
                };
                Repositorio.Agregar(solicitudDB);
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error("Error al solicitar no abordo {0}", ex);
            }
            return resultado;
        }
    }
}
