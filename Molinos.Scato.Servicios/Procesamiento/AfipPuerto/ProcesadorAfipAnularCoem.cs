using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;
using System.Linq;
using System.Text;

namespace Molinos.Scato.Servicios.Procesamiento.AfipPuerto
{
    public class ProcesadorAfipAnularCoem : ProcesadorComando<AfipAnularCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipAnularCoem(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipAnularCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Id) ?? throw new Exception("No existe la COEM con el id especificado");
                var codigoEstado = coemDB.AfipCoemEstado.Codigo;
                //Se anula la COEM, siempre que esta se encuentre en el estado en CURSO/REGISTRADA, identificada por un identificador de Caratula
                if (codigoEstado != "REG" && codigoEstado != "CUR")
                {
                    throw new Exception("La COEM debe estar en estado 'En curso' (CUR) o 'Registrada' (REG) para poder anularlse");
                }

                var res = comunicacionEmbarqueServicioHelper.AnularCOEM(coemDB.IdentificadorCaratula, coemDB.IdentificadorCOEM).Body.AnularCOEMResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }
                var estado = Repositorio.Obtener<AfipCoemEstado>(x => x.Codigo == "ANU");
                coemDB.AfipCoemEstado = estado;

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Baja,
                    Entidad = JsonConverter<AfipCoem>.Serialize(coemDB),
                    ClaseId = comando.Id
                };
                Repositorio.Agregar(logABM);

                Repositorio.GuardarCambios();

            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al anular COEM {0}", e);
            }
            return resultado;
        }
    }
}
