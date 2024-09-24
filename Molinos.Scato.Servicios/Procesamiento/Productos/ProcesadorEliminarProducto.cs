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
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento.Productos
{
    public class ProcesadorEliminarProducto : ProcesadorComando<EliminarProducto>
    {
        public ProcesadorEliminarProducto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(EliminarProducto comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                if (ProductoEnUso(comando.Id))
                    throw new Exception("No se puede anular al producto ya que esta siendo utilizado en una Nominación y / o embarque");

                EliminarProducto(comando);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al intentar eliminar producto: {0}", e);
            }
            return resultado;
        }

        private bool ProductoEnUso(int id)
        {
            var materialBd = this.Repositorio.Obtener<MaterialPuerto>(id);
            var existeNominacion = Repositorio.Existe<Nominacion>(n => n.NominacionDatoTecnico.MaterialPuerto.Id == id && !n.FechaEliminacion.HasValue && !n.FechaEnvioLineUp.HasValue);
            var existeEmbarque = Repositorio.Existe<Embarque>(e => e.MaterialPuertoCantidad.Any(x => x.MaterialPuerto.Id == id && e.Ubicacion != 1));
            return existeEmbarque || existeNominacion;
        }

        private void EliminarProducto(EliminarProducto comando)
        {
            var materialBd = this.Repositorio.Obtener<MaterialPuerto>(comando.Id);
            materialBd.Activo = false;
            string json = "MaterialPuerto:" + Conversor.Convertir<MaterialPuerto, MaterialPuertoDto>(materialBd).ToJson();
            var tiposDeCalidad = this.Repositorio.Listar<TipoDeCalidad>(tc => tc.MaterialPuerto.Id == comando.Id);
            json += ", TipoDeCalidad:" + Conversor.ConvertirList<TipoDeCalidad, TipoDeCalidadDto>(tiposDeCalidad).ToJson();
            foreach (TipoDeCalidad tc in tiposDeCalidad)
            {
                tc.Activo = false;
                var calidades = this.Repositorio.Listar<CalidadValor>(cv => cv.TipoDeCalidad.Id == tc.Id);
                json += ", CalidadValor:" + Conversor.ConvertirList<CalidadValor, CalidadValorDto>(calidades).ToJson();
                foreach (CalidadValor cv in calidades)
                {
                    cv.Activo = false;
                }
            }
            var documentos = this.Repositorio.Listar<DocumentoMaterialPuerto>(d => d.MaterialPuerto.Id == materialBd.Id);
            foreach(DocumentoMaterialPuerto doc in documentos)
            {
                doc.Activo = false;
            }
            this.AgregarLogBaja(comando, json);
        }

        private void AgregarLogBaja(EliminarProducto comando, string json)
        {
            var logEdicion = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Baja,
                Entidad = json,
                ClaseId = comando.Id
            };
            Repositorio.Agregar(logEdicion);
        }
    }
}