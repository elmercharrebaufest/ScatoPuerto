using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.HorariosExportador;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
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
                var horario = this.Repositorio.Obtener<Dominio.Entidades.HorariosExportador>(h => h.Id == comando.Obj.Id);

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

        private bool ExisteHorarioEnPeriodo(Dominio.Entidades.HorariosExportador horario, EditarHorarioExportador comando)
        {
            var horariosBd = this.Repositorio.Listar<Dominio.Entidades.HorariosExportador>(h => h.ModuloDeCarga_Id == horario.ModuloDeCarga_Id && h.Id != horario.Id && h.MaterialPuerto.Id == horario.MaterialPuerto.Id && h.Exportador.Id == horario.Exportador.Id);
            if (horariosBd == null)
            {
                return false;
            }
            foreach (Dominio.Entidades.HorariosExportador h in horariosBd)
            {
                var fecInicio = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaInicio, comando.Obj.HoraInicio));
                var fecFin = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaFin, comando.Obj.HoraFin));
                if (fecInicio < h.Fin && fecFin > h.Inicio)
                    return true;
            }
            return false;
        }

        private bool HorarioFueraDeCargas(Dominio.Entidades.HorariosExportador horario, EditarHorarioExportador comando)
        {
            var fechaPrimeraCarga = ObtenerFechaPrimeraCarga(horario.ModuloDeCarga_Id, horario);
            var fechaUltimaCarga = ObtenerFechaUltimaCarga(horario.ModuloDeCarga_Id, horario);
            if (fechaPrimeraCarga == null && fechaUltimaCarga == null)
                return false;
            var fecInicio = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaInicio, comando.Obj.HoraInicio));
            var fecFin = Convert.ToDateTime(string.Format("{0} {1}", comando.Obj.FechaFin, comando.Obj.HoraFin));
            if (fecInicio < fechaPrimeraCarga || fecFin > fechaUltimaCarga)
                return true;
            return false;
        }

        private DateTime? ObtenerFechaPrimeraCarga(int modCargaId, Dominio.Entidades.HorariosExportador horario)
        {
            IList<ModuloDeCargaPlanillaDeTurnos> turnos = new List<ModuloDeCargaPlanillaDeTurnos>();
            if (horario.MaterialPuerto.EsLiquido)
            {
                turnos = this.Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(t => t.ModuloDeCarga.Id == modCargaId &&
                t.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Any(d => d.Exportador.Id == horario.Exportador.Id && d.MaterialPuerto.Id == horario.MaterialPuerto.Id
                && d.Destino.Id == horario.Destino.Id && d.BodegaParcel == horario.BodegaParcel));
            }
            else
            {
                turnos = this.Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(t => t.ModuloDeCarga.Id == modCargaId &&
                t.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Any(d => d.Exportador.Id == horario.Exportador.Id && d.MaterialPuerto.Id == horario.MaterialPuerto.Id
                ));
            }
            var priFechaTurno = turnos.OrderBy(t => t.Fecha).ThenBy(t => t.TurnoPuerto.Orden).FirstOrDefault();
            var horarioTurno = priFechaTurno.TurnoPuerto.Nombre.Substring(0, 2) + ":00";

            TimeSpan horaIniTurno = TimeSpan.Parse(horarioTurno);
            DateTime fechaIni = priFechaTurno.Fecha.Value.Date.Add(horaIniTurno);
            return fechaIni;
        }

        private DateTime? ObtenerFechaUltimaCarga(int modCargaId, Dominio.Entidades.HorariosExportador horario)
        {
            IList<ModuloDeCargaPlanillaDeTurnos> turnos = new List<ModuloDeCargaPlanillaDeTurnos>();
            if (horario.MaterialPuerto.EsLiquido)
            {
                turnos = this.Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(t => t.ModuloDeCarga.Id == modCargaId &&
                t.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Any(d => d.Exportador.Id == horario.Exportador.Id && d.MaterialPuerto.Id == horario.MaterialPuerto.Id
                && d.Destino.Id == horario.Destino.Id && d.BodegaParcel == horario.BodegaParcel));
            }
            else
            {
                turnos = this.Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(t => t.ModuloDeCarga.Id == modCargaId &&
                t.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Any(d => d.Exportador.Id == horario.Exportador.Id && d.MaterialPuerto.Id == horario.MaterialPuerto.Id));
            }
            var ultFechaTurno = turnos.OrderBy(t => t.Fecha).ThenBy(t => t.TurnoPuerto.Orden).LastOrDefault();
            var horarioTurno = ultFechaTurno.TurnoPuerto.Nombre.Substring(3, 2) + ":00";

            TimeSpan horaFinTurno = TimeSpan.Parse(horarioTurno == "24:00" ? "23:59" : horarioTurno);
            DateTime fechaFin = ultFechaTurno.Fecha.Value.Date.Add(horaFinTurno);
            return fechaFin;
        }
    }
}