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

			this._productosPermitidos = productosPermitidos;
			this._exportadoresPermitidos = exportadoresPermitidos;
			this._muellePermitido = muellePermitido;
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

			if (_productosPermitidos != null && _productosPermitidos.Any())
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

			var dataPage = query.Select(a => new
			{
				Acuerdo = a,
				Detalles = a.AcuerdoDetalles.Select(d => new {
					d.CantidadTotal,
					Material = d.MaterialPuerto.Descripcion
				}),

				TodosLosVinculos = a.AcuerdoDetalles
									.SelectMany(d => d.AcuerdoEmbarques)
									.Select(ae => new {
										ae.Id,
										ae.Cantidad,
										EmbarqueId = ae.Embarque.Id,
										EmbarqueNombre = ae.Embarque.Patente,
										Producto = ae.AcuerdoDetalle.MaterialPuerto.Descripcion
									})
			}).ToList();

			var resultado = dataPage.Select(item =>
			{
				var resumenDetalles = item.Detalles.Select(d => {
					decimal vinculadaGlobalProducto = item.TodosLosVinculos
						.Where(v => v.Producto == d.Material)
						.Sum(x => x.Cantidad);

					return new AcuerdoDetalleResumenDto
					{
						Producto = d.Material,
						CantidadTotal = d.CantidadTotal,
						CantidadDisponible = d.CantidadTotal - vinculadaGlobalProducto
					};
				}).ToList();

				decimal cantidadTotalAcuerdo = item.Detalles.Sum(d => d.CantidadTotal);
				decimal cantidadTotalVinculadaGlobal = item.TodosLosVinculos.Sum(x => x.Cantidad);
				decimal cantidadTotalVinculadaEsteEmbarque = item.TodosLosVinculos
					.Where(v => v.EmbarqueId == idEmbarqueActual)
					.Sum(x => x.Cantidad);

				string relacion = "No";
				if (cantidadTotalVinculadaEsteEmbarque > 0)
				{
					if (cantidadTotalVinculadaEsteEmbarque == totalTnEmbarque && item.TodosLosVinculos.Any(x => x.Cantidad > 0))
						relacion = "Si";
					else
						relacion = "Parcial";
				}

				var vinculoActual = item.TodosLosVinculos.FirstOrDefault(v => v.EmbarqueId == idEmbarqueActual);

				return new AcuerdoPorEmbarcacionDto
				{
					IdAcuerdo = item.Acuerdo.Id,
					Descripcion = item.Acuerdo.Descripcion,
					Muelle = item.Acuerdo.MuelleDeCarga != null ? item.Acuerdo.MuelleDeCarga.Descripcion : string.Empty,
					Exportador = item.Acuerdo.Exportador != null ? item.Acuerdo.Exportador.Nombre : string.Empty,
					Productos = item.Detalles.Where(d => d.Material != null).Select(d => d.Material).Distinct().ToList(),
					DetallesResumen = resumenDetalles,
					CantidadTotal = cantidadTotalAcuerdo,
					CantidadAsociada = cantidadTotalVinculadaEsteEmbarque,
					CantidadDisponible = cantidadTotalAcuerdo - cantidadTotalVinculadaGlobal,
					RelacionAcuerdo = relacion,
					IdAcuerdoEmbarqueActual = vinculoActual != null ? (int?)vinculoActual.Id : null,
					EmbarquesAsociados = item.TodosLosVinculos.Select(v => new EmbarqueAsociadoDto
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