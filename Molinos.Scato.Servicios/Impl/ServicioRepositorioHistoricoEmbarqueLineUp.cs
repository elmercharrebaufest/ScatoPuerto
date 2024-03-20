using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using System;
using System.Activities;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Molinos.Scato.Servicios.Impl
{
	public class ServicioRepositorioHistoricoEmbarqueLineUp : IServicioRepositorioBase<HistoricoEmbarqueLineUp, HistoricoEmbarqueLineUpDto>
	{
		private readonly IRepositorio _repositorio;
		private readonly IConversor _conversor;

		public ServicioRepositorioHistoricoEmbarqueLineUp(
			IRepositorio repositorio,
			IConversor conversor)
		{
			_repositorio = repositorio;
			_conversor = conversor;
		}

		public List<HistoricoEmbarqueLineUpDto> ListarByFK(long id)
		{
			try
			{
				var query = _repositorio.Listar<HistoricoEmbarqueLineUp>(q => q.EmbarqueId == id);
				var result = _conversor.ConvertirList<HistoricoEmbarqueLineUp, HistoricoEmbarqueLineUpDto>(query).ToList();
				return result;
			}
			catch (Exception ex)
			{
				throw ex;
			}
		}
	}
}
