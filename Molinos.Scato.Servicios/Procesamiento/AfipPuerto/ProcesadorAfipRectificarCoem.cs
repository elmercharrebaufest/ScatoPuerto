using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Linq;
using System.Text;

namespace Molinos.Scato.Servicios.Procesamiento.AfipPuerto
{
	public class ProcesadorAfipRectificarCoem : ProcesadorComando<AfipRectificarCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;
        public ProcesadorAfipRectificarCoem(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }
        public override Resultado Ejecutar(AfipRectificarCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coem = comando.Dto;
                var coemDb = Repositorio.Obtener<AfipCoem>(coem.Id) ?? throw new Exception("No existe la COEM con el id especificado");

                // Campos que no vienen en el dto pero que igual no deben variar
                coem.FechaRegistro = coemDb.FechaRegistro;
                coem.IdentificadorCaratula = coemDb.IdentificadorCaratula;
                coem.IdentificadorCOEM = coemDb.IdentificadorCOEM;

                var res = this.comunicacionEmbarqueServicioHelper.RectificarCOEM(coem).Body.RectificarCOEMResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }

                var mercaderiasSueltas = this.Conversor.Convertir<AfipCoemDto, AfipCoem>(coem).MercaderiasSueltas;
                foreach (var declaracion in coemDb.MercaderiasSueltas.ToList())
                {
                    Repositorio.Remover(declaracion);
                }
                foreach (var declaracion in mercaderiasSueltas)
                {
                    coemDb.MercaderiasSueltas.Add(declaracion);
                }

                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error("Error al rectificar Coem {0}", ex);
            }
            return resultado;
        }
    }
}
