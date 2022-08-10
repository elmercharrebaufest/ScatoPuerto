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
            int moduloCargaId = comando.IdModuloDeCarga;
            #region Elimando
            var lineasDeEmbarque = Repositorio.Listar<ModuloDeCargaLineasDeEmbarque>(x => x.ModuloDeCarga.Id == moduloCargaId);
            foreach (var linea in lineasDeEmbarque)
            {
                var listaLineaDeEmbarque = comando.Dto.FindAll(x => x.Id == linea.Id);

                if (listaLineaDeEmbarque.Count == 0)
                {
                    Repositorio.Remover<ModuloDeCargaLineasDeEmbarque>(linea);
                }


            }
            #endregion

            #region Guardando y Actualizando
            foreach (var linea in comando.Dto)
            {
                var lineaDeEmbarque = Repositorio.Obtener<ModuloDeCargaLineasDeEmbarque>(x => x.Id == linea.Id);
                var material = Repositorio.Obtener<MaterialPuerto>(x => x.Id == linea.MaterialPuerto.Id);
                var tipoLineaEmbarque = Repositorio.Obtener<TipoLineaEmbarque>(x => x.Id == linea.TipoLineaEmbarque.Id);
                if (lineaDeEmbarque != null)
                {
                    lineaDeEmbarque.ModuloDeCarga = moduloDeCarga;
                    lineaDeEmbarque.Linea = tipoLineaEmbarque.Linea;
                    lineaDeEmbarque.TipoLineaEmbarque = tipoLineaEmbarque;
                    lineaDeEmbarque.MaterialPuerto = material;
                    lineaDeEmbarque.TkInicial = linea.TkInicial;
                    lineaDeEmbarque.TemperaturaInicial = linea.TemperaturaInicial;
                    lineaDeEmbarque.AlturaInicialCM = linea.AlturaInicialCM;
                    lineaDeEmbarque.AlturaInicialMM = linea.AlturaInicialMM;
                    lineaDeEmbarque.DensidadInicial = linea.DensidadInicial;
                    lineaDeEmbarque.TemperaturaFinal = linea.TemperaturaFinal;
                    lineaDeEmbarque.Litros = linea.Litros;
                    lineaDeEmbarque.DensidadFinal = linea.DensidadFinal;
                    lineaDeEmbarque.AlturaFinalCM = linea.AlturaFinalCM;
                    lineaDeEmbarque.AlturaFinalMM = linea.AlturaFinalMM;
                    lineaDeEmbarque.Kilos = linea.Kilos;
                    lineaDeEmbarque.TkFinal = linea.TkFinal;
                }
                else
                {

                    var lineaEmbarque = new ModuloDeCargaLineasDeEmbarque()
                    {
                        ModuloDeCarga = moduloDeCarga,
                        Linea = tipoLineaEmbarque.Linea,
                        TipoLineaEmbarque = tipoLineaEmbarque,
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
            #endregion



        }

        protected override void Validar(GuardarLineasDeEmbarque comando, Resultado resultado)
        {

        }


    }
}