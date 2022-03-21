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
    public class ProcesadorGuardarBalanzadas : ProcesadorModificar<GuardarBalanzadas>
    {
        public ProcesadorGuardarBalanzadas(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override void ModificarEntidad(GuardarBalanzadas comando)
        {
            var moduloDeCargaBalanzas = Repositorio.Obtener<ModuloDeCargaBalanzas>(x => x.Id == comando.moduloBalanzas.id);
            var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == comando.moduloBalanzas.moduloDeCarga_Id);
            var motivoFallaBalanza = Repositorio.Obtener<MotivosFallasBalanza>(x => x.Id == comando.moduloBalanzas.MotivoFalla_ID);

            moduloDeCarga.FechaDeModificacion = DateTime.Now;

            if (moduloDeCargaBalanzas != null){

            }
            else
            {
                moduloDeCargaBalanzas = new ModuloDeCargaBalanzas()
                {
                    ModuloDeCarga = moduloDeCarga,
                    MotivosFallasBalanza = motivoFallaBalanza,
                    Observaciones = comando.moduloBalanzas.Observaciones
                };
            }

            moduloDeCarga.ModuloDeCargaBalanzas.Add(moduloDeCargaBalanzas);

            Repositorio.GuardarCambios();

            int id = moduloDeCargaBalanzas.Id;

            foreach (var balanzada in comando.moduloBalanzas.Balanzadas)
            {
                var balanzada_db = Repositorio.Obtener<Balanzada>(x => x.Id == balanzada.id && x.NumeroBalanza == balanzada.NumeroBalanza);
                balanzada_db.ModuloDeCargaBalanzas = moduloDeCargaBalanzas;

            }

            Repositorio.GuardarCambios();


        }

        protected override void Validar(GuardarBalanzadas comando, Resultado resultado)
        {

        }


    }
}