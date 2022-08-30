using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarPlanillaDeEmbarque : ProcesadorModificar<GuardarPlanillaDeEmbarque>
    {
        public ProcesadorGuardarPlanillaDeEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarPlanillaDeEmbarque comando)
        {
            var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == comando.IdModuloDeCarga);

            ///////////////////////////
            ///// PROCESO PARA EL HISTORICO /////
            if (moduloDeCarga.FechaDeCreacion == null)
                moduloDeCarga.FechaDeCreacion = DateTime.Now;
            else
                moduloDeCarga.FechaDeModificacion = DateTime.Now;

            ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST", comando.nombreUsuario);

            var planillaDeEmbarque = Repositorio.Obtener<ModuloDeCargaPlanillaDeEmbarque>(x => x.Id == comando.Dto.Id);

            if (planillaDeEmbarque != null)
            {
                planillaDeEmbarque.ModuloDeCarga = moduloDeCarga;
                planillaDeEmbarque.FechaComienzoCarga = comando.Dto.FechaComienzoCarga;
                planillaDeEmbarque.FechaFinalizacionCarga = comando.Dto.FechaFinalizacionCarga;
                planillaDeEmbarque.TanqueDeAbordo = comando.Dto.TanqueDeAbordo;
                planillaDeEmbarque.Tk = comando.Dto.Tk;
                planillaDeEmbarque.Tn = comando.Dto.Tn;
                planillaDeEmbarque.Cantidad = comando.Dto.Cantidad;
                planillaDeEmbarque.BodegaParcel = comando.Dto.BodegaParcel;
            }
            else
            {
                var MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(x => x.Id == comando.Dto.MaterialPuerto.Id);
                var Destino = Repositorio.Obtener<Destino>(x => x.Id == comando.Dto.Destino.Id);
                var Exportador = Repositorio.Obtener<Exportador>(x => x.Id == comando.Dto.Exportador.Id);

                planillaDeEmbarque = new ModuloDeCargaPlanillaDeEmbarque()
                {
                    ModuloDeCarga = moduloDeCarga,
                    Destino = Destino,
                    MaterialPuerto = MaterialPuerto,
                    Exportador = Exportador,
                    FechaComienzoCarga = comando.Dto.FechaComienzoCarga,
                    FechaFinalizacionCarga = comando.Dto.FechaFinalizacionCarga,
                    TanqueDeAbordo = comando.Dto.TanqueDeAbordo,
                    Tk = comando.Dto.Tk,
                    Tn = comando.Dto.Tn,
                    Cantidad = comando.Dto.Cantidad,
                    BodegaParcel = comando.Dto.BodegaParcel
                };

                moduloDeCarga.ModuloDeCargaPlanillaDeEmbarque.Add(planillaDeEmbarque);
            }

            Repositorio.GuardarCambios();
        }
        

        protected override void Validar(GuardarPlanillaDeEmbarque comando, Resultado resultado)
        {

        }


    }
}