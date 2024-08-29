using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Estrategias;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioTurno : IServicioTurno
    {
        private readonly IRepositorio _repositorio;
        protected ILogger Log { get; private set; }

        public ServicioTurno(IRepositorio repositorio, ILogger log)
        {
            this._repositorio = repositorio;
            Log = log;
        }

        // No debe usarse para inicio
        public bool CrearTurno(BalanzadaRecibidaDTO balanzada)
        {
            var moduloDeCarga = _repositorio.ObtenerConsultaEscalar(new ObtenerModuloDeCargaActivoPorVapor(balanzada.Vapor));

            if (moduloDeCarga != null)
            {
                var fecha = balanzada.Fecha;
                int nTurno = (fecha.Hour / 6) + 1;

                var planillaDeTurno = _repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(t => t.Fecha.HasValue && t.Fecha.Value.Date == fecha.Date && t.TurnoPuerto.Id == nTurno);
                if (planillaDeTurno == null)
                {

                    planillaDeTurno = new ModuloDeCargaPlanillaDeTurnos
                    {
                        ModuloDeCarga = moduloDeCarga,
                        EsLiquido = false,
                        Fecha = CrearFechaTurno(fecha, nTurno),
                        Enviado = false,
                        Cerrado = false,
                        TurnoPuerto = _repositorio.Obtener<TurnoPuerto>(x => x.Id == nTurno)
                    };
                    _repositorio.Agregar(planillaDeTurno);
                    _repositorio.GuardarCambios();
                }
            }
            return true;
        }

        private DateTime CrearFechaTurno(DateTime fechaBalanzada, int nTurno)
        {
            var fecha = fechaBalanzada.Date;
            int horas = (nTurno - 1) * 6;
            fecha.AddHours(horas);
            return fecha;
        }

    }
}