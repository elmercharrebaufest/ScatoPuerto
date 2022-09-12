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
    public class ProcesadorGuardarNirManual : ProcesadorModificar<GuardarNirManual>
    {
        public ProcesadorGuardarNirManual(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarNirManual comando)
        {

            ModuloDeCarga moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.IdModuloDeCarga);

            //ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST");
            List<ModuloDeCargaNirManualPuerto> moduloDeCargaNirManualPuertos_DB = Repositorio.Listar<ModuloDeCargaNirManualPuerto>(x => x.ModuloDeCarga.Id == comando.IdModuloDeCarga).ToList();

            foreach (var nir in moduloDeCargaNirManualPuertos_DB)
            {
                bool exist = false;
                foreach (var nirFront in comando.Dto)
                {
                    if (nirFront.Id <= 0) continue;
                    if (nirFront.Id == nir.Id)
                    {
                        exist = true;
                    }
                }
                if (!exist)
                {
                    Repositorio.Remover(nir);
                }
            }

            if(moduloDeCarga != null)
            {
                foreach (var item in comando.Dto)
                {
                    Bodega bodega = new Bodega();
                    if(item.Bodega != null) 
                        bodega = Repositorio.Obtener<Bodega>(x => x.Id == item.Bodega.Id);

                    ModuloDeCargaNirManualPuerto nir_DB = Repositorio.Obtener<ModuloDeCargaNirManualPuerto>(x => x.Id == item.Id);

                    if (nir_DB != null)
                    {
                        nir_DB.Fecha = item.Fecha;
                        nir_DB.Hora = item.Hora;
                        nir_DB.Ritmo = item.Ritmo;
                        nir_DB.HD = item.HD;
                        nir_DB.ProtBase = item.ProtBase;
                        nir_DB.Prot_BS = item.Prot_BS;
                        nir_DB.PH = item.PH;
                        nir_DB.Origen = item.Origen;
                        nir_DB.Mano = item.Mano;
                        nir_DB.Material_id = item.Material_id;
                        nir_DB.Bodega = bodega.Id > 0 ? bodega : null;
                    }
                    else
                    {
                        ModuloDeCargaNirManualPuerto moduloDeCargaNirManualPuerto_Db = new ModuloDeCargaNirManualPuerto()
                        {
                            ModuloDeCarga = moduloDeCarga,
                            Fecha = item.Fecha,
                            Hora = item.Hora,
                            Ritmo = item.Ritmo,
                            HD = item.HD,
                            ProtBase = item.ProtBase,
                            Prot_BS = item.Prot_BS,
                            PH = item.PH,
                            Origen = item.Origen,
                            Mano = item.Mano,
                            Material_id = item.Material_id,
                            Bodega = bodega.Id > 0 ? bodega : null
                    };

                        Repositorio.Agregar(moduloDeCargaNirManualPuerto_Db);
                    }
                }                
            }
            Repositorio.GuardarCambios();            
        }



        protected override void Validar(GuardarNirManual comando, Resultado resultado)
        {

        }
    }
}




