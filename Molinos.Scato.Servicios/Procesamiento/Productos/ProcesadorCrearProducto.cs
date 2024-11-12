using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Productos;
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

namespace Molinos.Scato.Servicios.Procesamiento.Productos
{
    public class ProcesadorCrearProducto : ProcesadorComando<CrearProducto>
    {
        public ProcesadorCrearProducto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(CrearProducto comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                VerificarExistenciaProducto(comando.Dto.MaterialPuerto);

                RegistrarProducto(comando);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al intentar crear producto: {0}", e);
            }
            return resultado;
        }

        private void VerificarExistenciaProducto(MaterialPuertoDto material)
        {
            if (ExisteProducto(material))
                throw new Exception("La descripción ingresada ya existe en otro producto.");
        }

        private void RegistrarProducto(CrearProducto comando)
        {
            var materialPuerto = Repositorio.Agregar(Conversor.Convertir<MaterialPuertoDto, MaterialPuerto>(comando.Dto.MaterialPuerto));
            AgregarCalidades(comando.Dto.TiposDeCalidad, materialPuerto);
            AgregarDocumentos(comando.Dto.Documentos, materialPuerto);
            AgregarLogAlta(comando, materialPuerto.Id);
        }

        private void AgregarCalidades(List<RegistroTipoDeCalidadDto> tiposDeCalidad, MaterialPuerto materialPuerto)
        {
            foreach (var tc in tiposDeCalidad)
            {
                var entidadTc = Conversor.Convertir<TipoDeCalidadDto, TipoDeCalidad>(tc.TipoDeCalidad);
                entidadTc.MaterialPuerto = materialPuerto;
                Repositorio.Agregar(entidadTc);
                AgregarCalidadesxTc(entidadTc, tc.CalidadValores);
            }
        }

        private void AgregarCalidadesxTc(TipoDeCalidad tipoCalidad, List<CalidadValorDto> calidades)
        {
            foreach (var cv in calidades)
            {
                var entidadCv = Conversor.Convertir<CalidadValorDto, CalidadValor>(cv);
                entidadCv.TipoDeCalidad = tipoCalidad;
                Repositorio.Agregar(entidadCv);
            }
        }

        private bool ExisteProducto(MaterialPuertoDto material)
        {
            return Repositorio.Existe<MaterialPuerto>(x => (x.Descripcion.ToLower().Trim() == material.Descripcion.ToLower().Trim()
            || x.DescripcionCorta.ToLower().Trim() == material.DescripcionCorta.ToLower().Trim() ||
            x.DescripcionCortaIngles.ToLower().Trim() == material.DescripcionCortaIngles.ToLower().Trim()) && x.Activo);
        }

        private void AgregarDocumentos(List<DocumentoMaterialPuertoDto> documentos, MaterialPuerto material)
        {
            if (documentos == null || !documentos.Any()) return;

            var documentosMaterialPuerto = documentos
                .Select(docDto => new DocumentoMaterialPuerto
                {
                    Documento = this.Repositorio.Obtener<Documento>(d => d.Id == docDto.Documento.Id),
                    MaterialPuerto = material,
                });

            foreach (var documentoMaterial in documentosMaterialPuerto)
            {
                this.Repositorio.Agregar(documentoMaterial);
            }
        }

        private void AgregarLogAlta(CrearProducto comando, int id)
        {
            var logAlta = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Alta,
                Entidad = comando.Dto.ToJson(),
                ClaseId = id
            };
            Repositorio.Agregar(logAlta);
        }
    }
}