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
            List<ModuloDeCargaPlanillaDeEmbarque> planillasDeEmbarque_DB = Repositorio.Listar<ModuloDeCargaPlanillaDeEmbarque>(x => x.ModuloDeCarga.Id == comando.IdModuloDeCarga).ToList();

            ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST", comando.nombreUsuario);

            foreach (var planilla_DB in planillasDeEmbarque_DB)
            {
                bool exist = false;
                foreach (var planilla in comando.Dto)
                {
                    if (planilla.Id <= 0) continue;
                    if (planilla.Id == planilla_DB.Id && planilla.Exportador != null && planilla.MaterialPuerto != null && planilla.Destino != null)
                    {
                        exist = true;
                    }
                }
                if (!exist)
                {
                    Repositorio.Remover(planilla_DB);
                }
            }

            if (comando.Dto != null)
            {
                foreach (var planilla in comando.Dto)
                {
                    if (planilla.Exportador != null && planilla.MaterialPuerto != null && planilla.Destino != null)
                    {
                        ModuloDeCargaPlanillaDeEmbarque planillaDB = Repositorio.Obtener<ModuloDeCargaPlanillaDeEmbarque>(x => x.Id == planilla.Id);
                        if (planillaDB != null)
                        {
                            planillaDB.ModuloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.IdModuloDeCarga);
                            planillaDB.Exportador = Repositorio.Obtener<Exportador>(planilla.Exportador.Id);
                            planillaDB.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(planilla.MaterialPuerto.Id);
                            planillaDB.Destino = Repositorio.Obtener<Destino>(x => x.Id == planilla.Destino.Id);
                            planillaDB.FechaComienzoCarga = planilla.FechaComienzoCarga;
                            planillaDB.FechaFinalizacionCarga = planilla.FechaFinalizacionCarga;
                            planillaDB.TanqueDeAbordo = planilla.TanqueDeAbordo;
                            planillaDB.Tk = planilla.Tk;
                            planillaDB.Tn = planilla.Tn;
                            planillaDB.Cantidad = planilla.Cantidad;
                            planillaDB.BodegaParcel = planilla.BodegaParcel;
                        }
                        else
                        {
                            planillaDB = new ModuloDeCargaPlanillaDeEmbarque()
                            {
                                ModuloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.IdModuloDeCarga),
                                Exportador = Repositorio.Obtener<Exportador>(planilla.Exportador.Id),
                                MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(planilla.MaterialPuerto.Id),
                                Destino = Repositorio.Obtener<Destino>(x => x.Id == planilla.Destino.Id),
                                FechaComienzoCarga = planilla.FechaComienzoCarga,
                                FechaFinalizacionCarga = planilla.FechaFinalizacionCarga,
                                TanqueDeAbordo = planilla.TanqueDeAbordo,
                                Tk = planilla.Tk,
                                Tn = planilla.Tn,
                                Cantidad = planilla.Cantidad,
                                BodegaParcel = planilla.BodegaParcel
                            };

                            Repositorio.Agregar(planillaDB);
                        }
                    }
                }
            }
            Repositorio.GuardarCambios();
    }
        

        protected override void Validar(GuardarPlanillaDeEmbarque comando, Resultado resultado)
        {

        }


    }
}