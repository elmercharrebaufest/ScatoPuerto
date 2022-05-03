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
        public ProcesadorGuardarNirManual(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override void ModificarEntidad(GuardarNirManual comando)
        {


            var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.IdModuloDeCarga);

            
                foreach (var item in comando.Dto)
                {
                     ModuloDeCargaNirManualPuerto moduloDeCargaNirManualPuerto_Db = Repositorio.Obtener<ModuloDeCargaNirManualPuerto>(x => x.Id == item.Id);

                    //Bodega bodega = Repositorio.Obtener<Bodega>(x => x.Id == item.Id);

                    if (moduloDeCargaNirManualPuerto_Db != null)
                    {
                        moduloDeCargaNirManualPuerto_Db.Fecha = item.Fecha;
                        moduloDeCargaNirManualPuerto_Db.Hora = item.Hora;
                        moduloDeCargaNirManualPuerto_Db.Ritmo = item.Ritmo;
                        moduloDeCargaNirManualPuerto_Db.HD = item.HD;
                        moduloDeCargaNirManualPuerto_Db.ProtBase = item.ProtBase;
                        moduloDeCargaNirManualPuerto_Db.Prot_BS = item.Prot_BS;
                        moduloDeCargaNirManualPuerto_Db.PH = item.PH;
                        moduloDeCargaNirManualPuerto_Db.Origen = item.Origen;
                        //moduloDeCargaNirManualPuerto_Db.Bodega = item.Bodega;
                        moduloDeCargaNirManualPuerto_Db.Mano = item.Mano;
                        moduloDeCargaNirManualPuerto_Db.Material_id = item.Material_id;
                        moduloDeCargaNirManualPuerto_Db.Bodega_id = item.Bodega_id;
                    }
                    else
                    {
                        moduloDeCargaNirManualPuerto_Db = new ModuloDeCargaNirManualPuerto()
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
                            //Bodega = item.Bodega,
                            Mano = item.Mano,
                            Material_id = item.Material_id,
                            Bodega_id = item.Bodega_id,
                        };
                    }


                    moduloDeCarga.ModuloDeCargaNirManualPuerto.Add(moduloDeCargaNirManualPuerto_Db);
                }
                Repositorio.GuardarCambios();
            
        }



        protected override void Validar(GuardarNirManual comando, Resultado resultado)
        {

        }
    }
}




