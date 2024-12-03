using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.HorariosExportador;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento.HorariosExportador
{
    public class ProcesadorEditarHorarioExportador : ProcesadorComando<EditarHorarioExportador>
    {
        public ProcesadorEditarHorarioExportador(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(EditarHorarioExportador comando)
        {
            var resultado = new Resultado();
            try
            {
                var horario = this.Repositorio.Obtener<Molinos.Scato.Dominio.Entidades.HorariosExportador>(h => h.Id == comando.Obj.Id);

                if (ExisteHorarioEnPeriodo(horario, comando))
                {
                    throw new Exception("Los valores ingresados de inicio y fin coinciden con los de otro producto/exportador, verifique.");
                }

                if (HorarioFueraDeCargas(horario, comando))
                {
                    throw new Exception("Los valores ingresados de inicio y fin se encuentran fuera del periodo de los turnos existentes, verifique.");
                }

                horario.Inicio = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaInicio, comando.Obj.HoraInicio));
                horario.Fin = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaFin, comando.Obj.HoraFin));

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = comando.Obj.ToJson(),
                    ClaseId = horario.Id
                };

                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al modificar horario {0}", e);
            }
            return resultado;
        }

        private bool ExisteHorarioEnPeriodo(Molinos.Scato.Dominio.Entidades.HorariosExportador horario, EditarHorarioExportador comando)
        {
            var horariosBd = this.Repositorio.Listar<Molinos.Scato.Dominio.Entidades.HorariosExportador>(h => h.ModuloDeCarga_Id == horario.ModuloDeCarga_Id && h.Id != horario.Id);
            if(horariosBd == null)
            {
                return false;
            }
            foreach(Molinos.Scato.Dominio.Entidades.HorariosExportador h in horariosBd)
            {
                var fecInicio = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaInicio, comando.Obj.HoraInicio));
                var fecFin = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaFin, comando.Obj.HoraFin));
                if (fecInicio < h.Fin && fecFin > h.Inicio)
                    return true;
            }
            return false;
        }

        private bool HorarioFueraDeCargas(Molinos.Scato.Dominio.Entidades.HorariosExportador horario, EditarHorarioExportador comando)
        {
            var fechaPrimeraCarga = ObtenerFechaPrimeraCarga(horario.ModuloDeCarga_Id);
            var fechaUltimaCarga = ObtenerFechaUltimaCarga(horario.ModuloDeCarga_Id);
            if (fechaPrimeraCarga == null && fechaUltimaCarga == null)
                return false;
            var fecInicio = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaInicio, comando.Obj.HoraInicio));
            var fecFin = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaFin, comando.Obj.HoraFin));
            if (fecInicio < fechaPrimeraCarga || fecFin > fechaUltimaCarga)
                return true;
            return false;
        }

        private DateTime? ObtenerFechaPrimeraCarga(int modCargaId)
        {
            var turnos = this.Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(t=> t.ModuloDeCarga.Id == modCargaId);
            var priFechaTurno = turnos.OrderBy(t => t.Fecha).FirstOrDefault();
            return priFechaTurno.Fecha;
        }

        private DateTime? ObtenerFechaUltimaCarga(int modCargaId)
        {
            var turnos = this.Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(t => t.ModuloDeCarga.Id == modCargaId);
            var ultFechaTurno = turnos.OrderBy(t => t.Fecha).LastOrDefault();
            return ultFechaTurno.Fecha;
        }
    }
}