using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Exportadores;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento.Exportadores
{
    public class ProcesadorModificarExportadorPuerto : ProcesadorComando<ModificarExportadorPuerto>
    {
        public ProcesadorModificarExportadorPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(ModificarExportadorPuerto comando)
        {
            var resultado = new Resultado();
            try
            {
                var exportador = Repositorio.Obtener<Exportador>(comando.Dto.Id);
                var existe = Repositorio.Obtener<Exportador>(e => e.Nombre.Trim().ToUpper() == comando.Dto.Nombre.Trim().ToUpper());
                if (existe != null)
                {
                    if (existe.Habilitado)
                    {
                        throw new Exception("El nombre ingresado ya existe en otro exportador.");
                    }
                    else
                    {
                        existe.Habilitado = true;
                        exportador.Habilitado = false;
                        AgregarLogReactivar(comando, existe);
                        AgregarLogDesactivar(comando, exportador);
                    }
                }
                else
                {
                    exportador.Nombre = comando.Dto.Nombre;
                    AgregarLogEdicion(comando);
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Hubo un error al intentar editar exportador.");
                throw ex;
            }
            return resultado;
        }

        private void AgregarLogEdicion(ModificarExportadorPuerto comando)
        {
            var logABM = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                ClaseId = comando.Dto.Id,
                Entidad = comando.Dto.ToJson()
            };
            Repositorio.Agregar(logABM);
        }

        private void AgregarLogReactivar(ModificarExportadorPuerto comando, Exportador exportadorDb)
        {
            var exportadorDto = Conversor.Convertir<Exportador, ExportadorDto>(exportadorDb);
            var logABM = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                ClaseId = exportadorDb.Id,
                Entidad = "Reactivacion -> " + exportadorDto.ToJson()
            };
            Repositorio.Agregar(logABM);
        }

        private void AgregarLogDesactivar(ModificarExportadorPuerto comando, Exportador exportadorDb)
        {
            var exportadorDto = Conversor.Convertir<Exportador, ExportadorDto>(exportadorDb);
            var logABM = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                ClaseId = exportadorDb.Id,
                Entidad = "Desactivacion -> " + exportadorDto.ToJson()
            };
            Repositorio.Agregar(logABM);
        }
    }
}