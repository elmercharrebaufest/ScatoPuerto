using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Transactions;

namespace Molinos.Scato.Servicios.Procesamiento
{
	public class ProcesadorGuardarAcuerdo : ProcesadorComando<GuardarAcuerdo>
	{
		public ProcesadorGuardarAcuerdo(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

		public override Resultado Ejecutar(GuardarAcuerdo comando)
		{
			var resultado = new Resultado();
			try
			{
				using (var scope = new TransactionScope())
				{

					var acuerdoDto = comando.Acuerdo;
					var conceptos = Repositorio.Listar<Concepto>();
					Acuerdo acuerdoDb;

					if (comando.Acuerdo.Id == 0) // Alta
					{
						acuerdoDb = new Acuerdo { AcuerdoDetalles = new List<AcuerdoDetalle>() };

						// Validar duplicidad de descripcion del Acuerdo
						var descripcionLimpia = acuerdoDto.Descripcion?.Trim();
						var nombreRepetido = Repositorio.Existe<Acuerdo>(a => a.Descripcion.Trim() == descripcionLimpia && a.FechaEliminacion == null);
						if (nombreRepetido)
						{
							throw new Exception("Ya existe un acuerdo con la misma descripción, verifique.");
						}

						Repositorio.Agregar(acuerdoDb);
					}
					else // Edición
					{
						acuerdoDb = Repositorio.Obtener<Acuerdo>(comando.Acuerdo.Id) ?? throw new Exception("No se ha encontrado el acuerdo con el ID especificado");

						// Validacion Muelle / Exportador
						bool cambioMuelle = acuerdoDto.MuelleDeCarga.Id != acuerdoDb.MuelleDeCarga.Id;
						bool cambioExportador = acuerdoDto.Exportador.Id != acuerdoDb.Exportador.Id;

						if (cambioMuelle || cambioExportador)
						{
							foreach (var detalleDb in acuerdoDb.AcuerdoDetalles)
							{
								bool tieneEmbarques = Repositorio.Existe<AcuerdoEmbarque>(ae => ae.AcuerdoDetalle.Id == detalleDb.Id);
								if (tieneEmbarques)
								{
									throw new Exception("No puede modificar los datos de producto/muelle/exportador ya que se encuentra asociado a embarques, verifique.");
								}
							}
						}

						// Validacion de modificacion de Producto
						foreach (var detalleDto in acuerdoDto.AcuerdoDetalles)
						{
							if (detalleDto.Id == 0) continue;
							var detalleDb = acuerdoDb.AcuerdoDetalles.FirstOrDefault(ad => ad.Id == detalleDto.Id);
							if (detalleDb == null) continue;

							bool productoModificado = detalleDto.MaterialPuerto.Id != detalleDb.MaterialPuerto.Id;
							if (productoModificado)
							{
								bool tieneEmbarques = Repositorio.Existe<AcuerdoEmbarque>(ae => ae.AcuerdoDetalle.Id == detalleDb.Id);
								if (tieneEmbarques)
								{
									throw new Exception("No puede modificar los datos de producto/muelle/exportador ya que se encuentra asociado a embarques, verifique.");
								}
							}

							var embarquesAsociados = Repositorio.Listar<AcuerdoEmbarque>(ae => ae.AcuerdoDetalle.Id == detalleDb.Id).ToList();
							if (embarquesAsociados.Any())
							{
								decimal cantidadAsociada = embarquesAsociados.Sum(ae => ae.Cantidad);
								if (detalleDto.CantidadTotal < cantidadAsociada)
								{
									throw new Exception("No se puede actualizar ya que la cantidad ingresada es menor a la asociada a los embarques, verifique.");
								}
							}
						}

						// Validar duplicidad de descripcion del Acuerdo
						var descripcionLimpiaEdicion = acuerdoDto.Descripcion?.Trim();
						var nombreRepetidoEdicion = Repositorio.Existe<Acuerdo>(a => a.Descripcion.Trim() == descripcionLimpiaEdicion && a.FechaEliminacion == null && a.Id != acuerdoDb.Id);
						if (nombreRepetidoEdicion)
						{
							throw new Exception("Ya existe un acuerdo con la misma descripción, verifique.");
						}
					}

					// Actualización de propiedades del Acuerdo
					acuerdoDb.AcuerdoTipo = Repositorio.Obtener<AcuerdoTipo>(comando.Acuerdo.AcuerdoTipo.Id);
					acuerdoDb.Exportador = Repositorio.Obtener<Exportador>(acuerdoDto.Exportador.Id);
					acuerdoDb.MuelleDeCarga = Repositorio.Obtener<MuelleDeCarga>(acuerdoDto.MuelleDeCarga.Id);
					acuerdoDb.Descripcion = acuerdoDto.Descripcion;
					acuerdoDb.FechaInicio = acuerdoDto.FechaInicio;
					acuerdoDb.FechaFin = acuerdoDto.FechaFin;

					// Remover detalles eliminados en pantalla
					var detallesAEliminar = acuerdoDb.AcuerdoDetalles
						.Where(ad => !acuerdoDto.AcuerdoDetalles.Any(d => d.Id == ad.Id)).ToList();

					foreach (var detalle in detallesAEliminar)
					{
						bool tieneEmbarques = Repositorio.Existe<AcuerdoEmbarque>(ae => ae.AcuerdoDetalle.Id == detalle.Id);
						if (tieneEmbarques)
						{
							throw new Exception("No puede eliminar el producto ya que se encuentra asociado a embarques, verifique.");
						}

						foreach (var concepto in detalle.AcuerdoDetalleConceptos.ToList())
						{
							Repositorio.Remover(concepto);
						}
						Repositorio.Remover(detalle);
					}

					// Actualizar o agregar detalles
					foreach (var detalleDto in acuerdoDto.AcuerdoDetalles)
					{
						AcuerdoDetalle detalleDb;

						if (detalleDto.Id == 0) // Nuevo detalle
						{
							detalleDb = new AcuerdoDetalle { AcuerdoDetalleConceptos = new List<AcuerdoDetalleConcepto>() };
							acuerdoDb.AcuerdoDetalles.Add(detalleDb);
						}
						else // Detalle existente
						{
							detalleDb = acuerdoDb.AcuerdoDetalles.First(ad => ad.Id == detalleDto.Id);
						}

						detalleDb.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(detalleDto.MaterialPuerto.Id);
						detalleDb.CantidadTotal = detalleDto.CantidadTotal;

						// Eliminar conceptos removidos
						var conceptosAEliminar = detalleDb.AcuerdoDetalleConceptos
							.Where(adc => !detalleDto.AcuerdoDetalleConceptos.Any(dc => dc.Concepto.Id == adc.Concepto.Id)).ToList();

						foreach (var concepto in conceptosAEliminar)
						{
							Repositorio.Remover(concepto);
						}

						// Agregar nuevos conceptos seleccionados
						var conceptosExistentesIds = detalleDb.AcuerdoDetalleConceptos.Select(adc => adc.Concepto.Id).ToList();
						var conceptosNuevos = detalleDto.AcuerdoDetalleConceptos.Where(dc => !conceptosExistentesIds.Contains(dc.Concepto.Id)).ToList();

						foreach (var detalleConcepto in conceptosNuevos)
						{
							var acuerdoDetalleConcepto = new AcuerdoDetalleConcepto
							{
								Concepto = conceptos.FirstOrDefault(c => c.Id == detalleConcepto.Concepto.Id)
							};
							detalleDb.AcuerdoDetalleConceptos.Add(acuerdoDetalleConcepto);
						}
					}

					Repositorio.GuardarCambios();

					// Lógica para el manejo de archivo
					var archivo = comando.Archivo;
					acuerdoDto.NombreArchivo = archivo?.Nombre;
					var path = ConfigurationManager.AppSettings["ArchivosPath"];
					var di = new DirectoryInfo($"{path}\\Acuerdos");

					if (!di.Exists)
					{
						di.Create();
					}

					if (comando.EliminarArchivo)
					{
						if (File.Exists(acuerdoDb.UbicacionArchivo))
						{
							File.Delete(acuerdoDb.UbicacionArchivo);
						}
						acuerdoDb.NombreArchivo = null;
						acuerdoDb.UbicacionArchivo = null;
					}

					if (archivo != null && archivo.Contenido.Length > 0)
					{
						var nombreArchivo = acuerdoDb.Id.ToString() + " - " + archivo.Nombre;
						var ubicacionArchivo = Path.Combine(path, "Acuerdos", nombreArchivo);
						acuerdoDb.NombreArchivo = archivo.Nombre;
						acuerdoDb.UbicacionArchivo = ubicacionArchivo;

						File.WriteAllBytes(ubicacionArchivo, archivo.Contenido);
					}

					var logABM = new LogABM
					{
						Pantalla = comando.GetType().Name,
						Usuario = comando.Usuario,
						Fecha = DateTime.Now,
						Evento = acuerdoDto.Id == 0 ? EventoABM.Alta : EventoABM.Modificacion,
						Entidad = acuerdoDto.ToJson(),
						ClaseId = acuerdoDb.Id
					};
					Repositorio.Agregar(logABM);

					Repositorio.GuardarCambios();
					scope.Complete();
				}
			}
			catch (Exception e)
			{
				resultado.Error("", e.Message);
				Log.Error("Error al guardar acuerdo: {0}", e);
			}
			return resultado;
		}
	}
}