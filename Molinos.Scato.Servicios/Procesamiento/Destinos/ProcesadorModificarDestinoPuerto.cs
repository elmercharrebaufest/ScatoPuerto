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
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
	public class ProcesadorModificarDestinoPuerto : ProcesadorComando<ModificarDestinoPuerto>
	{
		public ProcesadorModificarDestinoPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
		{
		}

		public override Resultado Ejecutar(ModificarDestinoPuerto comando)
		{
			var resultado = new Resultado();
			try
			{
				var nombre = comando.Destino.Destino.Nombre.Trim().ToUpper();
				var logABM = new LogABM
				{
					Pantalla = comando.GetType().Name,
					Usuario = comando.Usuario,
					Fecha = DateTime.Now,
					Evento = EventoABM.Modificacion,
					Entidad = comando.ToJson(),
					ClaseId = comando.Destino.Destino.Id
				};

				var destinoDb = Repositorio.Obtener<Destino>(comando.Destino.Destino.Id) ?? throw new Exception("No se encontró un destino con el id especificado");

				if (Repositorio.Existe<Destino>(d => d.Nombre.ToUpper() == nombre && d.Id != comando.Destino.Destino.Id && d.Activo))
				{
					throw new Exception("La descripción de destino ya existe, verifique la información");
				}

				var destinoInactivo = Repositorio.Obtener<Destino>(d => d.Nombre.ToUpper() == nombre && !d.Activo);
				if (destinoInactivo == null)
				{
					destinoDb.Nombre = comando.Destino.Destino.Nombre.Trim();
					destinoDb.CodigoSap = comando.Destino.Destino.CodigoSap;
					destinoDb.Nacionalidad = comando.Destino.Destino.Nacionalidad;
					this.EditarDocumentos(comando.Destino.Documentos, destinoDb);
				}
				else
				{
					destinoInactivo.Activo = true;
					destinoInactivo.CodigoSap = comando.Destino.Destino.CodigoSap;
					destinoInactivo.Nacionalidad = comando.Destino.Destino.Nacionalidad;
					this.EditarDocumentos(comando.Destino.Documentos, destinoInactivo);

					var destinoInactivoJSON = Conversor.Convertir<Destino, DestinoDto>(destinoInactivo).ToJson();
					logABM.Entidad = "REACTIVACIÓN " + destinoInactivoJSON;
					logABM.ClaseId = destinoInactivo.Id;

					destinoDb.Activo = false;
					this.EliminarDocumentos(destinoDb);

					var destinoDbJSON = Conversor.Convertir<Destino, DestinoDto>(destinoDb).ToJson();
					var logABM2 = new LogABM
					{
						Pantalla = comando.GetType().Name,
						Usuario = comando.Usuario,
						Fecha = DateTime.Now,
						Evento = EventoABM.Baja,
						Entidad = destinoDbJSON,
						ClaseId = destinoDb.Id
					};
					Repositorio.Agregar(logABM2);
				}
				Repositorio.Agregar(logABM);
				Repositorio.GuardarCambios();
			}
			catch (Exception e)
			{
				resultado.Error("", e.Message);
				Log.Error("Error al modificar destino {0}", e);
			}
			return resultado;
		}

		private void EditarDocumentos(List<DocumentoDestinoDto> documentos, Destino destino)
		{
			foreach (DocumentoDestinoDto docDto in documentos)
			{
				var docBd = this.Repositorio.Obtener<DocumentoDestino>(d => d.Documento.Id == docDto.Documento.Id && d.Destino.Id == destino.Id);
				if (docBd == null)
				{
					var documento = this.Repositorio.Obtener<Documento>(d => d.Id == docDto.Documento.Id);
					var docDestino = new DocumentoDestino();
					docDestino.Documento = documento;
					docDestino.Destino = destino;
					this.Repositorio.Agregar(docDestino);
				}
			}
			var documentoIds = documentos.Select(d => d.Documento.Id).ToList();
			var docsABorrar = this.Repositorio.Listar<DocumentoDestino>(dd => dd.Destino.Id == destino.Id &&
			!documentoIds.Contains(dd.Documento.Id));
			this.Repositorio.RemoverTodos(docsABorrar);
		}

		private void EliminarDocumentos(Destino destino)
		{
			var docsDestino = this.Repositorio.Listar<DocumentoDestino>(d => d.Destino.Id == destino.Id);
			this.Repositorio.RemoverTodos(docsDestino);
		}
	}
}