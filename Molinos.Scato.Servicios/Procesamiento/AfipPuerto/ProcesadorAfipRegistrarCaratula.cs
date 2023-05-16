using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipRegistrarCaratula : ProcesadorComando<AfipRegistrarCaratula>
    {
        public ProcesadorAfipRegistrarCaratula(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(AfipRegistrarCaratula comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var caratula = comando.Dto;
                if (String.IsNullOrEmpty(caratula.IdentificadorCaratula)) // Registro
                {
                    var guid = Guid.NewGuid().ToString("N");
                    var caratulaDb = new AfipCaratula
                    {
                        IdentificadorCaratula = guid.Substring(guid.Length - 16),
                        CodigoAduana = caratula.CodigoAduana,
                        CodigoLugarOperativo = caratula.CodigoLugarOperativo,
                        FechaArribo = caratula.FechaArribo,
                        FechaZarpada = caratula.FechaZarpada,
                        NombreMedioTransporte = caratula.NombreMedioTransporte,
                        NumeroViaje = caratula.NumeroViaje,
                        PuertoDestino = caratula.PuertoDestino,
                        Via = caratula.Via
                    };
                    var itinerario = caratula.Itinerario.Select(x => new AfipCaratulaItinerario { AfipCaratula = caratulaDb, Puerto = x.Puerto }).ToList();
                    caratulaDb.Itinerario = itinerario;
                    Repositorio.Agregar(caratulaDb);
                }
                else // Rectificación
                {
                    var caratulaDb = Repositorio.Obtener<AfipCaratula>(caratula.Id);
                    if (caratula == null)
                    {
                        throw new Exception("No existe una carátula con el id especificado");
                    }
                    Repositorio.RemoverTodos(caratulaDb.Itinerario);
                    caratulaDb.CodigoAduana = caratula.CodigoAduana;
                    caratulaDb.CodigoLugarOperativo = caratula.CodigoLugarOperativo;
                    caratulaDb.FechaArribo = caratula.FechaArribo;
                    caratulaDb.FechaZarpada = caratula.FechaZarpada;
                    caratulaDb.NombreMedioTransporte = caratula.NombreMedioTransporte;
                    caratulaDb.NumeroViaje = caratula.NumeroViaje;
                    caratulaDb.PuertoDestino = caratula.PuertoDestino;
                    caratulaDb.Via = caratula.Via;
                    var itinerario = caratula.Itinerario.Select(x => new AfipCaratulaItinerario { AfipCaratula = caratulaDb, Puerto = x.Puerto }).ToList();
                    caratulaDb.Itinerario = itinerario;
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al registrar caratula {0}", e.StackTrace);
            }
            return resultado;
        }
    }
}
