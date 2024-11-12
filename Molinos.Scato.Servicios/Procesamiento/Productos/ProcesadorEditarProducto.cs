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
    public class ProcesadorEditarProducto : ProcesadorComando<EditarProducto>
    {
        public ProcesadorEditarProducto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(EditarProducto comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                Validaciones(comando.Dto.MaterialPuerto);

                EditarProducto(comando);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al intentar crear producto: {0}", e);
            }
            return resultado;
        }

        private void Validaciones(MaterialPuertoDto material)
        {
            if (ExisteProducto(material))
                throw new Exception("La descripción ingresada ya existe en otro producto.");

            if (ProductoEnUso(material))
                throw new Exception("No puede modificar el estado liquido/solido del producto, porque él mismo esta utilizándose en una nominación/embarque.");
        }

        private bool ExisteProducto(MaterialPuertoDto material)
        {
            return Repositorio.Existe<MaterialPuerto>(x => (x.Descripcion.ToLower().Trim() == material.Descripcion.ToLower().Trim()
            || x.DescripcionCorta.ToLower().Trim() == material.DescripcionCorta.ToLower().Trim() || x.DescripcionCortaIngles.ToLower().Trim() == material.DescripcionCortaIngles.ToLower().Trim())
            && x.Activo && x.Id != material.Id);
        }

        private bool ProductoEnUso(MaterialPuertoDto material)
        {
            var materialBd = this.Repositorio.Obtener<MaterialPuerto>(material.Id);
            var existeNominacion = Repositorio.Existe<Nominacion>(n => n.NominacionDatoTecnico.MaterialPuerto.Id == material.Id);
            var existeEmbarque = Repositorio.Existe<Embarque>(e => e.MaterialPuertoCantidad.Any(x => x.MaterialPuerto.Id == material.Id));
            return (existeEmbarque || existeNominacion) && materialBd.EsLiquido != material.EsLiquido;
        }

        private void EditarProducto(EditarProducto comando)
        {
            var materialBd = Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id);
            var materialDto = comando.Dto.MaterialPuerto;
            materialBd.Descripcion = materialDto.Descripcion;
            materialBd.DescripcionCorta = materialDto.DescripcionCorta;
            materialBd.DescripcionCortaIngles = materialDto.DescripcionCortaIngles;
            materialBd.CodigoSAP = materialDto.CodigoSAP;
            materialBd.EsLiquido = materialDto.EsLiquido;
            materialBd.Color = materialDto.Color;
            EditarCalidades(comando.Dto.TiposDeCalidad, materialBd);
            EditarDocumentos(comando.Dto.Documentos, materialBd);
            AgregarLogEdicion(comando);
        }

        private void EditarCalidades(List<RegistroTipoDeCalidadDto> tiposDeCalidad, MaterialPuerto materialPuerto)
        {
            //Edito las calidades existentes
            foreach (RegistroTipoDeCalidadDto tcDto in tiposDeCalidad)
            {
                var tcBd = Repositorio.Obtener<TipoDeCalidad>(tc => tc.Id == tcDto.TipoDeCalidad.Id);
                if (tcBd != null)
                {
                    tcBd.Descripcion = tcDto.TipoDeCalidad.Descripcion;
                    EditarCalidadesxTc(tcBd, tcDto.CalidadValores);
                }
                else
                {
                    var tcNuevo = Conversor.Convertir<TipoDeCalidadDto, TipoDeCalidad>(tcDto.TipoDeCalidad);
                    tcNuevo.MaterialPuerto = materialPuerto;
                    this.Repositorio.Agregar(tcNuevo);
                    this.AgregarCalidadesxTc(tcNuevo, tcDto.CalidadValores);
                }
            }
            //Elimino de forma logica las calidades borradas en la edicion.
            var calidadesABorrar = Repositorio.Listar<TipoDeCalidad>(x => x.MaterialPuerto.Id == materialPuerto.Id)
                .Where(tc => !tiposDeCalidad.Any(x => x.TipoDeCalidad.Id == tc.Id));

            foreach (TipoDeCalidad tcABorrar in calidadesABorrar)
            {
                tcABorrar.Activo = false;
            }
        }

        private void EditarCalidadesxTc(TipoDeCalidad tipoCalidad, List<CalidadValorDto> calidades)
        {
            foreach (CalidadValorDto cvAEditar in calidades)
            {
                var cvBd = Repositorio.Obtener<CalidadValor>(cv => cv.Id == cvAEditar.Id);
                if (cvBd != null)
                {
                    cvBd.Parametro = cvAEditar.Parametro;
                    cvBd.Valor = cvAEditar.Valor;
                }
                else
                {
                    var cvNuevo = Conversor.Convertir<CalidadValorDto, CalidadValor>(cvAEditar);
                    cvNuevo.TipoDeCalidad = tipoCalidad;
                    this.Repositorio.Agregar(cvNuevo);
                }
            }

            var valoresABorrar = this.Repositorio.Listar<CalidadValor>(c => c.TipoDeCalidad.Id == tipoCalidad.Id)
                .Where(x => !calidades.Any(y => y.Id == x.Id));

            foreach (CalidadValor cvABorrar in valoresABorrar)
            {
                cvABorrar.Activo = false;
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

        private void EditarDocumentos(List<DocumentoMaterialPuertoDto> documentos, MaterialPuerto material)
        {
            foreach (DocumentoMaterialPuertoDto docDto in documentos)
            {
                //Alta de documentos marcados
                var docBd = this.Repositorio.Obtener<DocumentoMaterialPuerto>(d => d.Documento.Id == docDto.Documento.Id && d.MaterialPuerto.Id == material.Id);
                if (docBd == null)
                {
                    var documento = this.Repositorio.Obtener<Documento>(d => d.Id == docDto.Documento.Id);
                    var docMaterial = new DocumentoMaterialPuerto();
                    docMaterial.Documento = documento;
                    docMaterial.MaterialPuerto = material;
                    this.Repositorio.Agregar(docMaterial);
                }
            }
            //Borrado de documentos desmarcados
            var documentoIds = documentos.Select(d => d.Documento.Id).ToList();
            var docsABorrar = this.Repositorio.Listar<DocumentoMaterialPuerto>(dm => dm.MaterialPuerto.Id == material.Id &&
            !documentoIds.Contains(dm.Documento.Id));
            this.Repositorio.RemoverTodos(docsABorrar);
        }

        private void AgregarLogEdicion(EditarProducto comando)
        {
            var logEdicion = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = comando.Dto.ToJson(),
                ClaseId = comando.Dto.MaterialPuerto.Id
            };
            Repositorio.Agregar(logEdicion);
        }
    }
}