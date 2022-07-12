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

            IList<ModuloDeCargaNirManualPuerto> nirs = Repositorio.Listar<ModuloDeCargaNirManualPuerto>(x => x.ModuloDeCarga.Id == moduloDeCarga.Id).ToList();
            Repositorio.RemoverTodos(nirs);

            ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST");

            foreach (var item in comando.Dto)
            {
                Bodega bodega = Repositorio.Obtener<Bodega>(x => x.Id == item.Bodega.Id);

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
                    Bodega = bodega
                };

                moduloDeCarga.ModuloDeCargaNirManualPuerto.Add(moduloDeCargaNirManualPuerto_Db);
            }

            Repositorio.GuardarCambios();
            
        }



        protected override void Validar(GuardarNirManual comando, Resultado resultado)
        {

        }
    }
}




