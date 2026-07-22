using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
	public class ListarPaginadoBalanzadas : IConsultaPaginada<BalanzadaDto>
	{
		private readonly int cargaInicialId;
		private readonly string cargaInicialNumeroBalanza;
		private readonly bool? enviado;
		private readonly Paginacion paginacion;

		public ListarPaginadoBalanzadas(int cargaInicialId, string cargaInicialNumeroBalanza, bool? enviado, Paginacion paginacion)
		{
			this.cargaInicialId = cargaInicialId;
			this.cargaInicialNumeroBalanza = cargaInicialNumeroBalanza;
			this.enviado = enviado;
			this.paginacion = paginacion;
		}

		public ListaPaginada<BalanzadaDto> Ejecutar(DbContext contexto)
		{
			((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;

			var query = contexto.Set<Balanzada>()
				.Where(x => x.CargaInicial_Id == cargaInicialId
						 && x.CargaInicial_NumeroBalanza == cargaInicialNumeroBalanza
						 && (enviado == null || x.EnviadoASap == enviado));

			var itemsTotales = query.Count();

			var resultado = query
				.OrderBy(x => x.Id)
				.Skip((paginacion.Pagina - 1) * paginacion.ItemsPorPagina)
				.Take(paginacion.ItemsPorPagina)
				.Select(x => new BalanzadaDto
				{
					Id = x.Id,
					NumeroBalanza = x.NumeroBalanza,
					PesoBruto = x.PesoBruto,
					PesoTara = x.PesoTara,
					PesoNeto = x.PesoNeto,
					Capacidad = x.Capacidad,
					Fecha = x.Fecha,
					EnviadoASap = x.EnviadoASap,
					ErrorSap = x.ErrorSap,
					CargaInicial_Id = x.CargaInicial_Id,
					CargaInicial_NumeroBalanza = x.CargaInicial_NumeroBalanza
				})
				.ToList();

			return new ListaPaginada<BalanzadaDto>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
		}
	}
}
