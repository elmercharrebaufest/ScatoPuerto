using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.SAP;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Procesamiento.SAP;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEliminarBuque : ProcesadorComando<EliminarBuque>
    {
        private readonly ZSDWS_SCATO servicioSap;
		private readonly IColaComandosAsincronico colaComandos;

		public ProcesadorEliminarBuque(IRepositorio repositorio, IConversor conversor, ILogger log, ZSDWS_SCATO servicioSap, 
            IColaComandosAsincronico colaComandos)
            : base(repositorio, conversor, log)
        {
            this.servicioSap = servicioSap;
			this.colaComandos = colaComandos;
		}

        public override Resultado Ejecutar(EliminarBuque comando)
        {
            var resultado = new Resultado();
            try
            {
                var vapor = Repositorio.Obtener<Vapor>(v => v.Id == comando.Id);
                vapor.Habilitado = false;
                var vaporInformacion = Repositorio.Obtener<VaporInformacion>(v => v.Vapor.Id == comando.Id);
                if (vaporInformacion != null)
                {
                    vaporInformacion.EnSap = false;
					#region Agregado a cola de ejecucion
					var comandoSap = new EnviarBajaBuqueSAP
					{
						VaporId = vaporInformacion.Vapor.Id,
						Usuario = comando.Usuario
					};

					this.colaComandos.Encolar(comandoSap);
					#endregion
				}
				var vaporDto = Conversor.Convertir<Vapor, VaporDto>(vapor);
                AgregarLogBaja(comando, vaporDto);
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error($"Error al intentar deshabilitar Buque id: {comando.Id}", ex);
                throw ex;
            }
            return resultado;
        }        

        private void AgregarLogBaja(EliminarBuque comando, VaporDto vapor)
        {
            var logBaja = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.UsuarioEjecuta,
                Fecha = DateTime.Now,
                Evento = EventoABM.Baja,
                Entidad = vapor.ToJson(),
                ClaseId = vapor.Id
            };
            Repositorio.Agregar(logBaja);
        }
    }
}