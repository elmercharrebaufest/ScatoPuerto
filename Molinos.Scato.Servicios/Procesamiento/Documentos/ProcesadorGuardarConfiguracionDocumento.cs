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
    public class ProcesadorGuardarConfiguracionDocumento : ProcesadorComando<GuardarConfiguracionDocumento>
    {
        private bool esCreacion = true;
        public ProcesadorGuardarConfiguracionDocumento(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(GuardarConfiguracionDocumento comando)
        {
            var resultado = new Resultado();
            try
            {
                var nominacion = Repositorio.Obtener<Nominacion>(comando.NominacionId);
                var configuracionesDb = nominacion.ConfiguracionDocumentos;
                if (configuracionesDb.Any())
                {
                    this.esCreacion = false;
                    this.RemoverConfiguraciones(configuracionesDb, comando.Configuraciones);
                }

                foreach (var configDto in comando.Configuraciones)
                {
                    var cliente = Repositorio.Obtener<CoordinadorPuerto>(configDto.CoordinadorPuerto.Id);
                    var destino = Repositorio.Obtener<Destino>(configDto.Destino.Id);
                    var configDb = configuracionesDb.FirstOrDefault(cd => cd.Id == configDto.Id);
                    if (configDb == null) // Insert
                    {
                        configDb = new ConfiguracionDocumento
                        {
                            Nominacion = nominacion,
                            NominacionDocumentos = new List<NominacionDocumento>()
                        };
                        Repositorio.Agregar(configDb);
                    }
                    configDb.CoordinadorPuerto = cliente;
                    configDb.Destino = destino;
                    configDb.CantidadDeJuegos = configDto.CantidadDeJuegos;
                    this.ActualizarDocumentos(configDb, configDto);
                }

                var logAMB = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = this.esCreacion ? EventoABM.Alta : EventoABM.Modificacion,
                    Entidad = comando.Configuraciones.ToJson(),
                    ClaseId = comando.NominacionId
                };
                Repositorio.Agregar(logAMB);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al Crear Configuracion de Documento {0}", e);
            }
            return resultado;
        }

        private bool NoPuedeEliminarseNomDoc(IEnumerable<NominacionDocumento> nomDocs)
        {
            return nomDocs.Any(d => d.Archivos.Count > 0);
        }

        /// <summary>
        /// Elimina aquellas configuraciones que están presentes en la db pero ausentes en el dto
        /// </summary>
        private void RemoverConfiguraciones(ICollection<ConfiguracionDocumento> configuracionesDb, ICollection<ConfiguracionDocumentoDto> configuracionesDto)
        {
            var configIds = configuracionesDto.Select(dto => dto.Id);
            var configuracionesRemover = configuracionesDb.Where(cd => !configIds.Contains(cd.Id));

            if (NoPuedeEliminarseNomDoc(configuracionesRemover.SelectMany(cr => cr.NominacionDocumentos)))
            {
                throw new Exception("No puede eliminarse una configuración ya que uno de sus documentos posee archivos");
            }

            // Se itera del ultimo al primero así no existen errores de índice al eliminar
            for (int i = configuracionesRemover.Count() - 1; i >= 0; i--)
            {
                var config = configuracionesRemover.ElementAt(i);

                for (int j = config.NominacionDocumentos.Count() - 1; j >= 0; j--)
                {
                    var nomDoc = config.NominacionDocumentos.ElementAt(j);
                    Repositorio.Remover(nomDoc);
                }

                Repositorio.Remover(config);
            }
        }

        /// <summary>
        /// Añade y remueve documentos de la configuración. En el dto solo llegan aquellos seleccionados.
        /// </summary>
        private void ActualizarDocumentos(ConfiguracionDocumento configDb, ConfiguracionDocumentoDto configDto)
        {
            var nomDocIds = configDto.NominacionDocumentos.Select(c => c.Id);
            var nomDocsRemover = configDb.NominacionDocumentos.Where(nd => !nomDocIds.Contains(nd.Id));

            if (NoPuedeEliminarseNomDoc(nomDocsRemover))
            {
                throw new Exception("No se puede devincular un documento que posee archivos");
            }

            // Se itera del ultimo al primero así no existen errores de índice al eliminar
            for (int i = nomDocsRemover.Count() - 1; i >= 0; i--)
            {
                var nomDoc = nomDocsRemover.ElementAt(i);
                Repositorio.Remover(nomDoc);
            }

            // Los documentos siempre se crean en estado "Borrador Solicitado"
            var estado = Repositorio.Obtener<NominacionDocumentoEstado>(e => e.Estado == "Borrador Solicitado");
            var nomDocsInsertar = configDto.NominacionDocumentos.Where(nd => nd.Id == 0);
            foreach (var nomDoc in nomDocsInsertar)
            {
                var documento = Repositorio.Obtener<Documento>(nomDoc.Documento.Id);
                var nomDocDb = new NominacionDocumento
                {
                    Documento = documento,
                    ConfiguracionDocumento = configDb,
                    NominacionDocumentoEstado = estado
                };

                Repositorio.Agregar(nomDocDb);
            }
        }
    }
}
