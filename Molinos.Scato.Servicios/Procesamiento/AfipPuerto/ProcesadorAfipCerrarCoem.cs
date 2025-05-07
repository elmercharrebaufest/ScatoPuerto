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
    public class ProcesadorAfipCerrarCoem : ProcesadorComando<AfipCerrarCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipCerrarCoem(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipCerrarCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Id) ?? throw new Exception("No existe la COEM con el id especificado");
                var estado = Repositorio.Obtener<AfipCoemEstado>(x => x.Codigo == "REG") ?? throw new Exception("No existe el estado 'REG' en la base de datos");

                var res = comunicacionEmbarqueServicioHelper.CerrarCOEM(coemDB.IdentificadorCaratula, coemDB.IdentificadorCOEM).Body.CerrarCOEMResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }
                coemDB.AfipCoemEstado = estado;

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = JsonConverter<AfipCoem>.Serialize(coemDB),
                    ClaseId = coemDB.Id
                };
                Repositorio.Agregar(logABM);

                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error("Error al cerrar COEM {0}", ex);
            }
            return resultado;
        }
    }
}
