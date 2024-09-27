using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearDocumento : ProcesadorComando<CrearDocumento>
    {
        public ProcesadorCrearDocumento(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(CrearDocumento comando)
        {
            var resultado = new ResultadoCrear();
            var dto = comando.Documento;
            try
            {
                if (Repositorio.Existe<Documento>(d => d.Activo && d.Nombre.Trim().ToUpper() == dto.Nombre.Trim().ToUpper()))
                {
                    throw new Exception("Existe un documento con el nombre indicado");
                }

                var tipoDocumento = Repositorio.Obtener<DocumentoTipo>(dto.DocumentoTipo.Id) ?? throw new Exception("No se pudo encontrar el tipo de documento " + dto.Nombre);

                var documento = Conversor.Convertir<DocumentoDto, Documento>(comando.Documento);
                documento.DocumentoTipo = tipoDocumento;
                documento.Activo = true;
                Repositorio.Agregar(documento);

                // Es necesario guardar para que el documento tenga un id el cual se usa para el log.
                Repositorio.GuardarCambios();

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Alta,
                    Entidad = comando.Documento.ToJson(),
                    ClaseId = documento.Id
                };
                Repositorio.Agregar(logABM);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al Crear Documento {0}", e);
            }
            return resultado;
        }
    }
}
