using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Linq;
using System.Collections.Generic;

namespace Molinos.Scato.Servicios.Procesamiento
{
	public class ProcesadorGuardarAdministracionEmbarque : ProcesadorModificar<GuardarAdministracionEmbarque>
	{
		public ProcesadorGuardarAdministracionEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null) : base(repositorio, conversor, log, servicioRepositorio)
		{
		}

        protected override void ModificarEntidad(GuardarAdministracionEmbarque comando)
        {
			var embarque = this.Repositorio.Obtener<Embarque>(e => e.Id == comando.EmbarqueId);
			var admEmbarqueBd = this.Repositorio.Obtener<AdministracionEmbarque>(admEmbarque => admEmbarque.Embarque.Id == comando.EmbarqueId);
			var estadoFacturado = this.Repositorio.Obtener<EstadoEmbarque>(e => e.Descripcion == "Facturado");
			var estadoAplicado = this.Repositorio.Obtener<EstadoEmbarque>(e => e.Descripcion == "Aplicado");
			var estadoEmbarque = this.Repositorio.Obtener<EstadoEmbarque>(e => e.Descripcion.ToLower() == comando.Dto.EstadoEmbarque.Descripcion.ToLower());
			bool esAlta = false;
			AdministracionEmbarque entidadNueva = null;

			if (admEmbarqueBd == null)
			{
				admEmbarqueBd = new AdministracionEmbarque
				{
					MuelleProp = comando.Dto.MuelleProp,
					AmarroMuelleProp = comando.Dto.AmarroMuelleProp,
					DesamarroMuelleProp = comando.Dto.DesamarroMuelleProp,
					NetoTonnage = comando.Dto.NetoTonnage,
					EstadoEmbarque = estadoEmbarque,
				};

				if (comando.Facturar)
				{
					admEmbarqueBd.EstadoEmbarque = estadoFacturado;
					admEmbarqueBd.FechaFacturado = DateTime.Now;
				}

				entidadNueva = this.Repositorio.Agregar(admEmbarqueBd);

				esAlta = true;
				this.AgregarNotificacionAlta(comando, embarque);
			}
			else
			{
				this.AgregarNotificacionEdicion(comando, admEmbarqueBd);
				admEmbarqueBd.MuelleProp = comando.Dto.MuelleProp;
				admEmbarqueBd.AmarroMuelleProp = comando.Dto.AmarroMuelleProp;
				admEmbarqueBd.DesamarroMuelleProp = comando.Dto.DesamarroMuelleProp;
				admEmbarqueBd.NetoTonnage = comando.Dto.NetoTonnage;
				admEmbarqueBd.EstadoEmbarque = estadoEmbarque;

				if (comando.Facturar)
				{
					if (admEmbarqueBd.EstadoEmbarque?.Id != estadoAplicado?.Id)
					{
						throw new Exception("Solo se puede facturar un embarque en estado Aplicado.");
					}
					admEmbarqueBd.EstadoEmbarque = estadoFacturado;
					admEmbarqueBd.FechaFacturado = DateTime.Now;
				}

				this.AgregarLogEdicion(comando);
			}

			// Actualizar agencias y exportadores
			var agenciasActuales = admEmbarqueBd?.Agencias?.ToList();
            var agenciasNuevas = comando.Dto.Agencias.Select(a => a.Id).ToList();

			if (agenciasActuales != null && agenciasActuales.Any())
			{
				foreach (var agencia in agenciasActuales)
				{
					if (!agenciasNuevas.Contains(agencia.Id))
					{
						this.Repositorio.Remover(agencia);
					}
				}
			}

			// Agregar o actualizar agencias
			if (comando.Dto.Agencias != null)
			{
				foreach (var agenciaDto in comando.Dto.Agencias)
				{
					var agenciaExistente = agenciasActuales?.FirstOrDefault(a => a.Id == agenciaDto.Id);
					if (agenciaExistente == null)
					{
						var nuevaAgencia = new AdministracionEmbarqueAgencia
						{
							AdministracionEmbarque = admEmbarqueBd,
							AgenciaMaritimaPuerto = this.Repositorio.Obtener<AgenciaMaritimaPuerto>(a => a.Id == agenciaDto.AgenciaMaritimaPuerto.Id)
						};
						this.Repositorio.Agregar(nuevaAgencia);
					}
					else
					{
                    // Actualizar propiedades de la agencia existente si es necesario
						agenciaExistente.AgenciaMaritimaPuerto = this.Repositorio.Obtener<AgenciaMaritimaPuerto>(a => a.Id == agenciaDto.AgenciaMaritimaPuerto.Id);
					}
				}
			}

			// Actualizar exportadores
            var exportadoresActuales = admEmbarqueBd?.Exportadores?.ToList();
            var exportadoresNuevos = comando.Dto.Exportadores.Select(e => e.Id).ToList();

            // Eliminar exportadores que ya no están en el Dto
			if (exportadoresActuales != null && exportadoresActuales.Any())
			{
				foreach (var exportador in exportadoresActuales)
				{
					if (!exportadoresNuevos.Contains(exportador.Id))
					{
						this.Repositorio.Remover(exportador);
					}
				}
			}

			// Agregar o actualizar exportadores
			if (comando.Dto.Exportadores != null)
			{
				foreach (var exportadorDto in comando.Dto.Exportadores)
				{
					var exportadorExistente = exportadoresActuales?.FirstOrDefault(e => e.Id == exportadorDto.Id);
					if (exportadorExistente == null)
					{
						var nuevoExportador = new AdministracionEmbarqueExportador
						{
							AdministracionEmbarque = admEmbarqueBd, // Utilizar admEmbarqueBd tracking reference
							Exportador = this.Repositorio.Obtener<Exportador>(e => e.Id == exportadorDto.Exportador.Id)
						};
						this.Repositorio.Agregar(nuevoExportador);
					}
					else
					{
						exportadorExistente.Exportador = this.Repositorio.Obtener<Exportador>(e => e.Id == exportadorDto.Exportador.Id);
					}
				}
			}

			this.Repositorio.GuardarCambios();

			if (esAlta)
			{
				this.AgregarLogAlta(comando, entidadNueva);
			}
		}

		protected override void Validar(GuardarAdministracionEmbarque comando, Resultado resultado)
		{
			//throw new NotImplementedException();
		}

		private void AgregarLogAlta(GuardarAdministracionEmbarque comando, AdministracionEmbarque reg)
		{
			var logAlta = new LogABM
			{
				Pantalla = comando.GetType().Name,
				Usuario = comando.Usuario,
				Fecha = DateTime.Now,
				Evento = EventoABM.Alta,
				Entidad = comando.Dto.ToJson(),
				ClaseId = reg.Id
			};
			Repositorio.Agregar(logAlta);
			Repositorio.GuardarCambios();
		}

		private void AgregarLogEdicion(GuardarAdministracionEmbarque comando)
		{
			var logEdicion = new LogABM
			{
				Pantalla = comando.GetType().Name,
				Usuario = comando.Usuario,
				Fecha = DateTime.Now,
				Evento = EventoABM.Modificacion,
				Entidad = comando.Dto.ToJson(),
				ClaseId = comando.Dto.Id
			};
			Repositorio.Agregar(logEdicion);
		}

		private void AgregarNotificacionAlta(GuardarAdministracionEmbarque comando, Embarque embarque)
		{
			string paramsModif = null;
			var msj = "";

			if (comando.Dto.Agencias != null && comando.Dto.Agencias.Count() > 0)
				paramsModif += "agencias, ";
			if (comando.Dto.Exportadores != null && comando.Dto.Exportadores.Count() > 0)
				paramsModif += "exportadores, ";
			if (comando.Dto.NetoTonnage != 0)
				paramsModif += "net Tonnage, ";
			if (comando.Dto.MuelleProp != null)
				paramsModif += "muelle proporcional, ";

			msj = "Se ha registrado desde el módulo de administración el valor de: " + paramsModif +
			"para embarque: " + embarque.Patente.ToUpper() + " - " +
			(embarque.SanBenito ? "San Benito" : embarque.Noryon ? "Noryon" : embarque.Vicentin ? "Vicentin" : embarque.OtrosMuelles && embarque.OtroMuelleNombre != null ? embarque.OtroMuelleNombre : "");

			var notificacion = new NotificacionAdministracion()
			{
				Fecha = DateTime.Now,
				Mensaje = msj,
			};
			Repositorio.Agregar(notificacion);
		}

		private void AgregarNotificacionEdicion(GuardarAdministracionEmbarque comando, AdministracionEmbarque administracionEmbarque)
		{
			var admEmbarqueBd = administracionEmbarque;
			var admEmbarqueDtoActual = Conversor.Convertir<AdministracionEmbarque, AdministracionEmbarqueDto>(admEmbarqueBd);

			string paramsModif = null;
			var msj = "";

			if (comando.Dto.Exportadores != null &&
			(admEmbarqueBd.Exportadores == null ||
			!comando.Dto.Exportadores.Select(e => e.Id).SequenceEqual(admEmbarqueBd.Exportadores.Select(e => e.Id)))
			|| admEmbarqueDtoActual.Exportadores?.Select(x => x.Exportador) != comando.Dto.Exportadores?.Select(x => x.Exportador))
			{
				paramsModif += "exportadores, ";
			}

			if (comando.Dto.Agencias != null &&
			(admEmbarqueBd.Agencias == null ||
			!comando.Dto.Agencias.Select(e => e.Id).SequenceEqual(admEmbarqueBd.Agencias.Select(e => e.Id)))
			|| admEmbarqueDtoActual.Agencias?.Select(x => x.AgenciaMaritimaPuerto) != comando.Dto.Agencias?.Select(x => x.AgenciaMaritimaPuerto))
			{
				paramsModif += "agencias, ";
			}

			if (comando.Dto.NetoTonnage != admEmbarqueBd.NetoTonnage)
				paramsModif += "net Tonnage, ";
			if (comando.Dto.MuelleProp != admEmbarqueBd.MuelleProp)
				paramsModif += "muelle proporcional, ";

			msj = "Se ha modificado desde el módulo de administración el valor de: " + paramsModif +
			"para embarque: " + administracionEmbarque.Embarque.Patente.ToUpper() + " - " +
			(administracionEmbarque.Embarque.SanBenito ? "San Benito" : administracionEmbarque.Embarque.Noryon ? "Noryon" : administracionEmbarque.Embarque.Vicentin ? "Vicentin" : administracionEmbarque.Embarque.OtrosMuelles
			&& administracionEmbarque.Embarque.OtroMuelleNombre != null ? administracionEmbarque.Embarque.OtroMuelleNombre : "");

			var notificacion = new NotificacionAdministracion()
			{
				Fecha = DateTime.Now,
				Mensaje = msj,
			};
			Repositorio.Agregar(notificacion);
		}
	}
}