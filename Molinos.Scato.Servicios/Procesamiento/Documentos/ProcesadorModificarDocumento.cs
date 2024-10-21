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
    public class ProcesadorModificarDocumento : ProcesadorComando<ModificarDocumento>
    {
        public ProcesadorModificarDocumento(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(ModificarDocumento comando)
        {
            var resultado = new ResultadoCrear();
            var dto = comando.Documento;
            try
            {
                if (Repositorio.Existe<Documento>(d => d.Activo && d.Id != dto.Id && d.Nombre.Trim().ToUpper() == dto.Nombre.Trim().ToUpper()))
                {
                    throw new Exception("Existe un documento con el nombre indicado");
                }

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = dto.ToJson(),
                    ClaseId = dto.Id
                };
                Repositorio.Agregar(logABM);

                var tipoDocumento = Repositorio.Obtener<DocumentoTipo>(dto.DocumentoTipo.Id) ?? throw new Exception("No se pudo encontrar el tipo de documento " + dto.Nombre);

                var documentoEditado = Repositorio.Obtener<Documento>(dto.Id) ?? throw new Exception("No se encontró un documento con el id especificado");
                documentoEditado.Activo = false;

                var documento = Conversor.Convertir<DocumentoDto, Documento>(comando.Documento);
                documento.DocumentoTipo = tipoDocumento;
                documento.Activo = true;
                Repositorio.Agregar(documento);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al Modificar Documento {0}", e);
            }
            return resultado;
        }
    }
}
