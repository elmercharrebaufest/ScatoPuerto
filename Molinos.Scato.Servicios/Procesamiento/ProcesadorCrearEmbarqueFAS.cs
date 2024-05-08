using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearEmbarqueFAS : ProcesadorComando<CrearEmbarqueFAS>
    {
        public ProcesadorCrearEmbarqueFAS(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(CrearEmbarqueFAS comando)
        {
            var resultado = new Resultado();
            try
            {
                var recibos = comando.Recibos;
                var embarqueId = comando.EmbarqueId;

                var embarque = Repositorio.Obtener<Embarque>(embarqueId);
                var vaporInfo = Repositorio.Obtener<VaporInformacion>(vi => vi.Vapor.Id == embarque.Vapor.Id);
                var tipoDeContrato = Repositorio.Obtener<TipoDeContrato>(tc => tc.Descripcion == "FAS");
                var muelles = Repositorio.Listar<MuelleDeCarga>(muelle =>
                    (embarque.SanBenito && muelle.Descripcion == "San Benito") ||
                    (embarque.Vicentin && muelle.Descripcion == "Vicentin") ||
                    (embarque.Noryon && muelle.Descripcion == "Nouryon") ||
                    (embarque.OtrosMuelles && muelle.Descripcion == "Otros Muelles")
                );

                if (muelles.Count == 0)
                {
                    throw new Exception("No se han seleccionado muelles");
                }

                var materiales = new List<MaterialPuertoCantidad>();
                materiales.AddRange(embarque.MaterialPuertoCantidad);

                // Si hay más muelles que materiales entonces deben crearse más nominaciones ya que estas pueden tener solo un embarque
                // Para lograr esto, se duplica un material
                var diferencia = muelles.Count - embarque.MaterialPuertoCantidad.Count;
                if (diferencia > 0)
                {
                    for (int i = 0; i < diferencia; i++)
                    {
                        materiales.Add(materiales.ElementAt(i));
                    }
                }

                int materialIndex = 0;
                foreach (var material in materiales)
                {
                    var coordinadores = embarque.Coordinadores.Select(c => new NominacionDatoTecnicoCoordinadorPuerto
                    {
                        CoordinadorPuerto = c.CoordinadorPuerto,
                        Cantidad = material.Cantidad
                    }).ToList();

                    var datoTecnico = new NominacionDatoTecnico
                    {
                        MaterialPuerto = material.MaterialPuerto,
                        CantidadTotal = material.Cantidad,
                        VaporInformacion = vaporInfo,
                        ETARecalada = embarque.FechaRecalada,
                        ObligacionDeCarga = embarque.ObligacionCarga,
                        TipoDeContrato = tipoDeContrato,
                        ATAPuerto = embarque.ATA,
                        AgenciaMaritimaPuerto = embarque.Agencias,
                        NominacionDatoTecnicoCoordinadorPuerto = coordinadores,
                        MuelleDeCarga = muelles.ElementAtOrDefault(materialIndex) ?? muelles.First()
                    };

                    int numeroRecibo = 1;
                    var recibosDb = recibos.Select(recibo =>
                    {
                        var reciboDb = new NominacionRecibo()
                        {
                            NumeroRecibo = numeroRecibo,
                            Formato = recibo.Formato,
                            Exportador = Repositorio.Obtener<Exportador>(x => x.Id == recibo.Exportador.Id),
                            DescripcionesBienes = recibo.DescripcionesBienes,
                            Unidad = recibo.Unidad,
                            PuertoDeDescarga = recibo.PuertoDeDescarga,
                            PuertoDeCarga = recibo.PuertoDeCarga,
                            Ajuste = recibo.Ajuste,
                            Cantidad = recibo.Cantidad,
                            MostrarBodegas = recibo.MostrarBodegas,
                            MostrarDestinos = recibo.MostrarDestinos,
                            RecibosPorDia = recibo.RecibosPorDia
                        };
                        numeroRecibo++;
                        return reciboDb;
                    }).ToList();

                    var nominacion = new Nominacion
                    {
                        FechaCreacion = DateTime.Now,
                        FechaEnvioLineUp = DateTime.Now,
                        Embarque = embarque,
                        NominacionDatoTecnico = datoTecnico,
                        NominacionRecibo = recibosDb
                    };

                    Repositorio.Agregar(nominacion);
                    materialIndex++;
                }


                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al registrar embarque FAS", e.Message);
            }
            return resultado;
        }

    }
}
