using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
	public class ProcesadorCrearHistoricoEmbarqueLineUp : ProcesadorComando<CrearHistoricoEmbarqueLineUp>
	{
		public ProcesadorCrearHistoricoEmbarqueLineUp(
			IRepositorio repositorio, 
			IConversor conversor, 
			ILogger log)
			: base(repositorio, conversor, log) {
		}

		public override Resultado Ejecutar(CrearHistoricoEmbarqueLineUp comando)
		{
			var resultado = new ResultadoCrear();
			try
			{
				Log.Info("Se procederá a ejecutar ProcesadorCrearHistoricoEmbarqueLineUp");

				var entity = Conversor.Convertir<HistoricoEmbarqueLineUpDto, HistoricoEmbarqueLineUp>(comando.Dto);

				Repositorio.Agregar(entity);
				Repositorio.GuardarCambios();
				//resultado.Id = (int)entity.GetType().GetProperty("Id").GetValue(entity, null);
			}
			catch (Exception e)
			{
				Log.Error(e, "Ocurrió un error al intentar ejecutar ProcesadorCrearHistoricoEmbarqueLineUp");
				resultado.Error("", Textos.OrdenCargaInterna_Error);
			}

			return resultado;
		}
	}
}
