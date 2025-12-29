
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
    public class ProcesadorActualizarPlanillaDeTurnos : ProcesadorModificar<ActualizarPlanillaDeTurno>
    {
        public ProcesadorActualizarPlanillaDeTurnos(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio) { }
        protected override void ModificarEntidad(ActualizarPlanillaDeTurno comando)
        {
            var planillaDeTurno = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(comando.IdPlanillaDeTurno);
            planillaDeTurno.Cerrado = comando.Cerrado;

            var turnoPuerto = new TurnoPuertoDto
            {
                Id = planillaDeTurno.TurnoPuerto.Id,
                Nombre = planillaDeTurno.TurnoPuerto.Nombre,
                Orden = planillaDeTurno.TurnoPuerto.Orden
            };


            var planillaDto = new ModuloDeCargaPlanillaDeTurnosDto
            {
                Id = planillaDeTurno.Id,
                Fecha = planillaDeTurno.Fecha,               
                TurnoPuerto = turnoPuerto,
                Cerrado = planillaDeTurno.Cerrado,
                Enviado = planillaDeTurno.Enviado,
                GuardadoPorTablerista = planillaDeTurno.GuardadoPorTablerista,
                GuardadoPorRecibidor = planillaDeTurno.GuardadoPorRecibidor,
                EsLiquido = planillaDeTurno.EsLiquido,
                FechaCierreTurno = planillaDeTurno.FechaCierreTurno
            };


            var logAlta = new LogABM
            {
                Evento = EventoABM.Modificacion,
                Pantalla = "Planilla De Turno",
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Entidad = planillaDto.ToJson(),
                ClaseId = comando.IdPlanillaDeTurno
            };
            Repositorio.Agregar(logAlta);

            Repositorio.GuardarCambios();
                      
        }

        protected override void Validar(ActualizarPlanillaDeTurno comando, Resultado resultado)
        {            
        }
    }
}
