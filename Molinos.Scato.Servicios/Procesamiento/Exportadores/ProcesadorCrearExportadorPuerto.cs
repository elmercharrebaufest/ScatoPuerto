using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Exportador;
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
    public class ProcesadorCrearExportadorPuerto : ProcesadorComando<CrearExportadorPuerto>
    {
        public ProcesadorCrearExportadorPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(CrearExportadorPuerto comando)
        {
            var resultado = new Resultado();
            try
            {
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
                        AgregarLogReactiva(comando, existe);
                    }
                }
                else
                {
                    var exportador = Conversor.Convertir<ExportadorDto, Exportador>(comando.Dto);
                    Repositorio.Agregar(exportador);
                    AgregarLogAlta(comando);
                }
                Repositorio.GuardarCambios();
                return resultado;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Hubo un error al intentar crear exportador.");
                throw ex;
            }
        }

        private void AgregarLogAlta(CrearExportadorPuerto comando)
        {
            var logABM = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Alta,
                ClaseId = 0,
                Entidad = comando.Dto.ToJson()
            };

            Repositorio.Agregar(logABM);
        }

        private void AgregarLogReactiva(CrearExportadorPuerto comando, Exportador exportador)
        {
            var logABM = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Alta,
                ClaseId = exportador.Id,
                Entidad = "Reactivacion -> " + comando.Dto.ToJson()
            };

            Repositorio.Agregar(logABM);
        }
    }
}