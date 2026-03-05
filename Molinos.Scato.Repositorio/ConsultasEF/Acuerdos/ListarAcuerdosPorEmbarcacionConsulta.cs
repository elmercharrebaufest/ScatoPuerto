using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
	public class ListarAcuerdosPorEmbarcacionConsulta : IConsultaPaginada<AcuerdoPorEmbarcacionDto>
	{
		private readonly int idEmbarqueActual;
		private readonly DateTime? periodo;
		private readonly string muelle;
		private readonly string material;
		private readonly string exportador;
		private readonly Paginacion paginacion;
		private readonly decimal totalTnEmbarque;
		private readonly bool filtrarPorEmbarque;

		private readonly List<string> _productosPermitidos;
		private readonly List<string> _exportadoresPermitidos;
		private readonly string _muellePermitido;
		private readonly bool _tieneProductosPermitidos;

		public ListarAcuerdosPorEmbarcacionConsulta(
			int idEmbarque,
			Paginacion paginacion,
			FiltrosAcuerdoPorEmbarcacionDto filtros,
			List<string> productosPermitidos,
			List<string> exportadoresPermitidos,
			string muellePermitido,
			decimal totalTnEmbarque,
			bool filtrarPorEmbarque = true)
		{
			this.idEmbarqueActual = idEmbarque;
			this.paginacion = paginacion;
			this.totalTnEmbarque = totalTnEmbarque;
			this.filtrarPorEmbarque = filtrarPorEmbarque;

			this.periodo = filtros?.Periodo;
			this.muelle = filtros?.Muelle?.Descripcion;
			this.material = filtros?.Material?.Descripcion;
			this.exportador = filtros?.Exportador?.Nombre;

			this._productosPermitidos = productosPermitidos ?? new List<string>();
			this._exportadoresPermitidos = exportadoresPermitidos;
			this._muellePermitido = muellePermitido;
			this._tieneProductosPermitidos = _productosPermitidos.Any();
		}

		public ListaPaginada<AcuerdoPorEmbarcacionDto> Ejecutar(DbContext contexto)
		{
			DateTime? primerDiaMes = null;
			DateTime? ultimoDiaMes = null;

			if (periodo.HasValue && periodo.Value != DateTime.MinValue && periodo.Value.Year > 1900)
			{
				primerDiaMes = new DateTime(periodo.Value.Year, periodo.Value.Month, 1);
				ultimoDiaMes = primerDiaMes.Value.AddMonths(1).AddDays(-1);
			}

			var query = contexto.Set<Acuerdo>().AsQueryable();

			query = query.Where(a => a.FechaEliminacion == null);

			if (filtrarPorEmbarque)
			{
				query = query.Where(a => a.AcuerdoDetalles.Any(ad => ad.AcuerdoEmbarques.Any(ae => ae.Embarque.Id == idEmbarqueActual)));
			}

			if (_tieneProductosPermitidos)
			{
				query = query.Where(a => a.AcuerdoDetalles.Any(d => _productosPermitidos.Contains(d.MaterialPuerto.Descripcion)));
			}

			if (_exportadoresPermitidos != null && _exportadoresPermitidos.Any())
			{
				query = query.Where(a => _exportadoresPermitidos.Contains(a.Exportador.Nombre));
			}

			if (!string.IsNullOrEmpty(_muellePermitido))
			{
				query = query.Where(a => a.MuelleDeCarga.Descripcion == _muellePermitido);
			}

			if (primerDiaMes.HasValue && ultimoDiaMes.HasValue)
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

			if (!string.IsNullOrEmpty(material))
			{
				query = query.Where(a => a.AcuerdoDetalles.Any(d => d.MaterialPuerto.Descripcion.Contains(material)));
			}

			var itemsTotales = query.Count();

			query = query.OrderBy(a => a.Id);

			var saltear = (paginacion.Pagina - 1) * paginacion.ItemsPorPagina;

			if (paginacion.ItemsPorPagina > 0)
			{
				query = query.Skip(saltear).Take(paginacion.ItemsPorPagina);
			}

			var acuerdoIds = query.Select(a => a.Id).ToList();

			var acuerdos = contexto.Set<Acuerdo>()
				.Where(a => acuerdoIds.Contains(a.Id))
				.ToList();

			var resultado = acuerdos.Select(a =>
			{
				var detallesDelAcuerdo = _tieneProductosPermitidos
					? a.AcuerdoDetalles
						.Where(d => _productosPermitidos.Contains(d.MaterialPuerto.Descripcion))
						.ToList()
					: a.AcuerdoDetalles.ToList();

				var todosLosVinculos = a.AcuerdoDetalles
					.SelectMany(d => d.AcuerdoEmbarques)
					.Select(ae => new
					{
						ae.Id,
						ae.Cantidad,
						EmbarqueId = ae.Embarque.Id,
						EmbarqueNombre = ae.Embarque.Patente,
						Producto = ae.AcuerdoDetalle.MaterialPuerto.Descripcion
					})
					.ToList();

				var resumenDetalles = detallesDelAcuerdo.Select(d =>
				{
					decimal vinculadaGlobalProducto = todosLosVinculos
						.Where(v => v.Producto == d.MaterialPuerto.Descripcion)
						.Sum(x => x.Cantidad);

					return new AcuerdoDetalleResumenDto
					{
						Producto = d.MaterialPuerto.Descripcion,
						CantidadTotal = d.CantidadTotal,
						CantidadDisponible = d.CantidadTotal - vinculadaGlobalProducto
					};
				}).ToList();

				decimal cantidadTotalAcuerdo = detallesDelAcuerdo.Sum(d => d.CantidadTotal);
				decimal cantidadTotalVinculadaGlobal = todosLosVinculos.Sum(x => x.Cantidad);
				decimal cantidadTotalVinculadaEsteEmbarque = todosLosVinculos
					.Where(v => v.EmbarqueId == idEmbarqueActual)
					.Sum(x => x.Cantidad);

				string relacion = "No";
				if (cantidadTotalVinculadaEsteEmbarque > 0)
				{
					if (cantidadTotalVinculadaEsteEmbarque == totalTnEmbarque && todosLosVinculos.Any(x => x.Cantidad > 0))
						relacion = "Si";
					else
						relacion = "Parcial";
				}

				var vinculoActual = todosLosVinculos.FirstOrDefault(v => v.EmbarqueId == idEmbarqueActual);

				return new AcuerdoPorEmbarcacionDto
				{
					IdAcuerdo = a.Id,
					Descripcion = a.Descripcion,
					Muelle = a.MuelleDeCarga != null ? a.MuelleDeCarga.Descripcion : string.Empty,
					Exportador = a.Exportador != null ? a.Exportador.Nombre : string.Empty,
					Productos = detallesDelAcuerdo
						.Where(d => d.MaterialPuerto != null)
						.Select(d => d.MaterialPuerto.Descripcion)
						.Distinct()
						.ToList(),
					DetallesResumen = resumenDetalles,
					CantidadTotal = cantidadTotalAcuerdo,
					CantidadAsociada = cantidadTotalVinculadaEsteEmbarque,
					CantidadDisponible = cantidadTotalAcuerdo - cantidadTotalVinculadaGlobal,
					RelacionAcuerdo = relacion,
					IdAcuerdoEmbarqueActual = vinculoActual != null ? (int?)vinculoActual.Id : null,
					EmbarquesAsociados = todosLosVinculos.Select(v => new EmbarqueAsociadoDto
					{
						IdAcuerdoEmbarque = v.Id,
						NombreEmbarque = v.EmbarqueNombre,
						IdEmbarque = v.EmbarqueId,
						Producto = v.Producto,
						Cantidad = v.Cantidad
					}).ToList()
				};
			}).ToList();

			return new ListaPaginada<AcuerdoPorEmbarcacionDto>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
		}
	}
}