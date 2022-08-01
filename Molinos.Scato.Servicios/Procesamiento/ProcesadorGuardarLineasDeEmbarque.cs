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
    public class ProcesadorGuardarLineasDeEmbarque : ProcesadorModificar<GuardarLineasDeEmbarque>
    {
        public ProcesadorGuardarLineasDeEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarLineasDeEmbarque comando)
        {
            var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == comando.IdModuloDeCarga);

            ///////////////////////////
            ///// PROCESO PARA EL HISTORICO /////
            if (moduloDeCarga.FechaDeCreacion == null)
                moduloDeCarga.FechaDeCreacion = DateTime.Now;
            else
                moduloDeCarga.FechaDeModificacion = DateTime.Now;

            ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST");

            foreach (var linea in comando.Dto)
            {
                var lineaDeEmbarque = Repositorio.Obtener<ModuloDeCargaLineasDeEmbarque>(x => x.Id == linea.Id);

                var material = Repositorio.Obtener<MaterialPuerto>(x => x.Id == linea.MaterialPuerto.Id);
                if (lineaDeEmbarque != null)
                {
                    lineaDeEmbarque.ModuloDeCarga = moduloDeCarga;
                    lineaDeEmbarque.Linea = linea.Linea;
                    lineaDeEmbarque.MaterialPuerto = material;
                    lineaDeEmbarque.TkInicial = linea.TkInicial;
                    lineaDeEmbarque.TemperaturaInicial = linea.TemperaturaInicial;
                    lineaDeEmbarque.AlturaInicialCM = linea.AlturaInicialCM ;
                    lineaDeEmbarque.AlturaInicialMM = linea.AlturaInicialMM ;
                    lineaDeEmbarque.DensidadInicial = linea.DensidadInicial;
                    lineaDeEmbarque.TemperaturaFinal = linea.TemperaturaFinal;
                    lineaDeEmbarque.Litros = linea.Litros;
                    lineaDeEmbarque.DensidadFinal = linea.DensidadFinal ;
                    lineaDeEmbarque.AlturaFinalCM = linea.AlturaFinalCM ;
                    lineaDeEmbarque.AlturaFinalMM = linea.AlturaFinalMM;
                    lineaDeEmbarque.Kilos = linea.Kilos;
                    lineaDeEmbarque.TkFinal = linea.TkFinal;
                }
                else
                {

                  var  lineaEmbarque = new ModuloDeCargaLineasDeEmbarque()
                    {
                    ModuloDeCarga = moduloDeCarga,
                    Linea = linea.Linea,
                    MaterialPuerto = material,
                    TkInicial = linea.TkInicial,
                    TemperaturaInicial = linea.TemperaturaInicial,
                    AlturaInicialCM = linea.AlturaInicialCM,
                    AlturaInicialMM = linea.AlturaInicialMM,
                    DensidadInicial = linea.DensidadInicial,
                    TemperaturaFinal = linea.TemperaturaFinal,
                    Litros = linea.Litros,
                    DensidadFinal = linea.DensidadFinal,
                    AlturaFinalCM = linea.AlturaFinalCM,
                    AlturaFinalMM = linea.AlturaFinalMM,
                    Kilos = linea.Kilos,
                    TkFinal = linea.TkFinal,
                };

                    moduloDeCarga.ModuloDeCargaLineasDeEmbarque.Add(lineaEmbarque);
                }
            }
             Repositorio.GuardarCambios();
            
        }

        protected override void Validar(GuardarLineasDeEmbarque comando, Resultado resultado)
        {

        }


    }
}