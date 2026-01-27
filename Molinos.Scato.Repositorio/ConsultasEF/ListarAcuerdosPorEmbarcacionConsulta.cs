using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto.Acuerdos;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
	public class ListarAcuerdosPorEmbarcacionConsulta : IConsultaPaginada<AcuerdoPorEmbarcacionDto>
	{
		private readonly int idEmbarque;
		private readonly DateTime? periodo;
		private readonly string muelle;
		private readonly string material;
		private readonly string exportador;
		private readonly Paginacion paginacion;

		public ListarAcuerdosPorEmbarcacionConsulta(int idEmbarque, Paginacion paginacion, FiltrosAcuerdosPorEmbarcacionDto filtros)
		{
			this.idEmbarque = idEmbarque;
			this.paginacion = paginacion;

			this.periodo = filtros?.Periodo;
			this.muelle = filtros?.Muelle?.Descripcion;
			this.material = filtros?.Material?.Descripcion;
			this.exportador = filtros?.Exportador?.Nombre;
		}

		public ListaPaginada<AcuerdoPorEmbarcacionDto> Ejecutar(DbContext contexto)
		{
			DateTime? primerDiaMes = periodo.HasValue ? new DateTime(periodo.Value.Year, periodo.Value.Month, 1) : (DateTime?)null;
			DateTime? ultimoDiaMes = periodo.HasValue ? primerDiaMes.Value.AddMonths(1).AddDays(-1) : (DateTime?)null;

			var query = contexto.Set<Acuerdo>().AsQueryable();

			if (periodo.HasValue)
			{
				query = query.Where(a => a.FechaInicio <= ultimoDiaMes && a.FechaFin >= primerDiaMes);
			}
			if (!string.IsNullOrEmpty(muelle))
			{
				query = query.Where(a => a.MuelleDeCarga.Descripcion == muelle);
			}
			if (!string.IsNullOrEmpty(exportador))
			{
				query = query.Where(a => a.Exportador.Nombre == exportador);
			}

			var listado = query.Select(a => new
			{
				a.Id,
				a.Descripcion,
				Detalles = a.AcuerdoDetalles.Select(d => new { d.MaterialPuerto.Descripcion, d.CantidadTotal }),
				MuelleNombre = a.MuelleDeCarga.Descripcion,
				ExportadorNombre = a.Exportador.Nombre,
				Vinculos = a.AcuerdoDetalles.SelectMany(ad => ad.AcuerdoEmbarques).Select(ae => new
				{
					IdLink = ae.Id,
					EmbarqueId = ae.Embarque.Id,
					BuqueNombre = ae.Embarque.Patente,
					Cantidad = ae.Cantidad
				})
			}).ToList();

			var queryList = listado.Select(a => {
				var dto = new AcuerdoPorEmbarcacionDto
				{
					IdAcuerdo = a.Id,
					Descripcion = a.Descripcion,
					Muelle = a.MuelleNombre,
					Exportadores = a.ExportadorNombre,
					CantidadTotal = a.Detalles.Sum(d => (decimal?)d.CantidadTotal) ?? 0,
					Producto = string.Join(", ", a.Detalles.Select(d => d.Descripcion).Distinct()),
					EmbarquesAsociados = a.Vinculos.Select(v => v.BuqueNombre).Distinct().ToList()
				};

				decimal cantidadConsumida = a.Vinculos.Sum(v => (decimal?)v.Cantidad) ?? 0;
				dto.CantidadDisponible = dto.CantidadTotal - cantidadConsumida;
				dto.ProductoRelacionadoTotalmente = dto.CantidadDisponible <= 0;

				var vinculoActual = a.Vinculos.FirstOrDefault(v => v.EmbarqueId == idEmbarque);

				if (vinculoActual != null)
				{
					dto.EstadoAsociacion = "VINCULADO_ACTUAL";
					dto.IdAcuerdoEmbarque = vinculoActual.IdLink;
				}
				else if (a.Vinculos.Any())
				{
					dto.EstadoAsociacion = "VINCULADO_OTRO";
				}
				else
				{
					dto.EstadoAsociacion = "NO_VINCULADO";
				}

				return dto;
			})
			.Where(dto => string.IsNullOrEmpty(material) || dto.Producto.Contains(material))
			.ToList();

			var itemsTotales = queryList.Count();
			var saltear = (paginacion.Pagina - 1) * paginacion.ItemsPorPagina;

			var resultado = queryList.Skip(saltear);
			if (paginacion.ItemsPorPagina > 0)
			{
				resultado = resultado.Take(paginacion.ItemsPorPagina);
			}

			return new ListaPaginada<AcuerdoPorEmbarcacionDto>(resultado.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
		}
	}
}