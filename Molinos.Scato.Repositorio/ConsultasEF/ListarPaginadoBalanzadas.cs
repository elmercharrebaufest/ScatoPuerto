using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums; 
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;

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

			var query = contexto.Set<Balanzada>().AsNoTracking()
				.Where(x => x.CargaInicial_Id == cargaInicialId
						 && x.CargaInicial_NumeroBalanza == cargaInicialNumeroBalanza
						 && (enviado == null || x.EnviadoASap == enviado));

			var itemsTotales = query.Count();
			var esDesc = paginacion != null && paginacion.DireccionOrden == DirOrden.Desc;
			var ordenarPor = (paginacion?.OrdenarPor ?? "Id").ToLowerInvariant();

			switch (ordenarPor)
			{
				case "fecha":
					query = esDesc ? query.OrderByDescending(x => x.Fecha) : query.OrderBy(x => x.Fecha);
					break;
				case "pesobruto":
					query = esDesc ? query.OrderByDescending(x => x.PesoBruto) : query.OrderBy(x => x.PesoBruto);
					break;
				case "pesotara":
					query = esDesc ? query.OrderByDescending(x => x.PesoTara) : query.OrderBy(x => x.PesoTara);
					break;
				case "pesoneto":
					query = esDesc ? query.OrderByDescending(x => x.PesoNeto) : query.OrderBy(x => x.PesoNeto);
					break;
				case "capacidad":
					query = esDesc ? query.OrderByDescending(x => x.Capacidad) : query.OrderBy(x => x.Capacidad);
					break;
				default:
					query = esDesc ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id);
					break;
			}

			var resultadoRaw = query
				.Skip((paginacion.Pagina - 1) * paginacion.ItemsPorPagina)
				.Take(paginacion.ItemsPorPagina)
				.Select(x => new 
				{
					Balanzada = x,
					TransaccionError = contexto.Set<TransaccionesSAP>()
						.Where(t => t.Entidad == "Balanzada" && t.Entidad_Id == x.Id && t.Estado == "Error")
						.OrderByDescending(t => t.Id)
						.FirstOrDefault()
				})
				.ToList();

			var resultado = resultadoRaw.Select(x => new BalanzadaDto
				{
					Id = x.Balanzada.Id,
					NumeroBalanza = x.Balanzada.NumeroBalanza,
					PesoBruto = x.Balanzada.PesoBruto,
					PesoTara = x.Balanzada.PesoTara,
					PesoNeto = x.Balanzada.PesoNeto,
					Capacidad = x.Balanzada.Capacidad,
					Fecha = x.Balanzada.Fecha,
					EnviadoASap = x.Balanzada.EnviadoASap,
					CargaInicial_Id = x.Balanzada.CargaInicial_Id,
					CargaInicial_NumeroBalanza = x.Balanzada.CargaInicial_NumeroBalanza,
                    ErrorSap = ExtraerMensajeSap(x.TransaccionError?.ResponseSAP)
				})
				.ToList();

			return new ListaPaginada<BalanzadaDto>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
		}

		private string ExtraerMensajeSap(string responseSap)
		{
			if (string.IsNullOrEmpty(responseSap)) return null;

			var match = Regex.Match(responseSap, @"<IM_MESSAGE>(.*?)</IM_MESSAGE>");
			if (match.Success)
			{
				return match.Groups[1].Value;
			}
			return "Error reportado por SAP";
		}
	}
}