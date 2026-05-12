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
    public class ProcesadorCrearDestinoPuerto : ProcesadorComando<CrearDestinoPuerto>
    {
        public ProcesadorCrearDestinoPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

		public override Resultado Ejecutar(CrearDestinoPuerto comando)
		{
			var resultado = new ResultadoCrear();
			try
			{
				var nombre = comando.Destino.Destino.Nombre.Trim().ToUpper();

				if (Repositorio.Existe<Destino>(d => d.Nombre.ToUpper() == nombre && d.Activo))
				{
					throw new Exception("La descripción de destino ya existe, verifique la información");
				}

				var destinoDb = new Destino
				{
					Nombre = nombre,
					CodigoSap = comando.Destino.Destino.CodigoSap,
					Nacionalidad = comando.Destino.Destino.Nacionalidad,
					Activo = true
				};

				Repositorio.Agregar(destinoDb);
				AgregarDocumentos(destinoDb, comando.Destino.Documentos);
				Repositorio.GuardarCambios();

				var logABM = new LogABM
				{
					Pantalla = "Destinos",
					Usuario = comando.Usuario,
					Fecha = DateTime.Now,
					Evento = EventoABM.Alta,
					Entidad = comando.ToJson(),
					ClaseId = destinoDb.Id
				};
				Repositorio.Agregar(logABM);
				Repositorio.GuardarCambios();
			}
			catch (Exception e)
			{
				resultado.Error("", e.Message);
				Log.Error("Error al crear destino {0}", e);
			}
			return resultado;
		}

		private void AgregarDocumentos(Destino destino, List<DocumentoDestinoDto> documentos)
        {
            if (documentos == null || !documentos.Any()) return;

            var documentosDestino = documentos
                .Select(docDto => new DocumentoDestino
                {
                    Documento = this.Repositorio.Obtener<Documento>(d => d.Id == docDto.Documento.Id),
                    Destino = destino,
                });

            foreach (var docDestino in documentosDestino)
            {
                this.Repositorio.Agregar(docDestino);
            }
        }
    }
}