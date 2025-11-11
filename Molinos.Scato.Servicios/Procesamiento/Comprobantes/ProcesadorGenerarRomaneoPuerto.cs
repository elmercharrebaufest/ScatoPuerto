using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento.Comprobantes
{
    public class ProcesadorGenerarRomaneoPuerto : ProcesadorComando<GenerarRomaneoPuerto>
    {
        public ProcesadorGenerarRomaneoPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(GenerarRomaneoPuerto comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.ModuloDeCargaId) ?? throw new Exception("No se encontró el módulo de carga especificado.");

                var tieneDetallesSolidos = moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Any(t => t.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Any());
                if (!tieneDetallesSolidos)
                {
                    throw new Exception("No existen cargas para generar el romaneo.");
                }

                var buque = Repositorio.Incluir<LineUp>().Where(l => l.ModuloDeCarga.Id == comando.ModuloDeCargaId).Select(l => l.Embarque.Vapor.Nombre).FirstOrDefault();
                var cantidadRomaneos = Repositorio.Contar<RomaneoPuerto>(r => r.ModuloDeCarga.Id == comando.ModuloDeCargaId);
                var parametro = Repositorio.Obtener<Parametros>(p => p.Descripcion == "NumeroInicioComprobante") ?? throw new Exception("No se encontró el parámetro NumeroInicioComprobante.");

                int numeroComprobante = int.Parse(parametro.Parametro3);

                var romaneoPuerto = new RomaneoPuerto
                {
                    UsuarioEmision = comando.Usuario,
                    ModuloDeCarga = moduloDeCarga,
                    NumeroRomaneo = cantidadRomaneos + 1,
                    RomaneoPuertoComprobantes = new List<RomaneoPuertoComprobante>(),
                    Estado = 1,
                };

                foreach (var turno in moduloDeCarga.ModuloDeCargaPlanillaDeTurnos)
                {
                    var detalleAgrupado = turno.ModuloDeCargaPlanillaDeTurnosDetallesSolido
                        .GroupBy(d => new
                        {
                            d.MaterialPuerto,
                            d.Bodega,
                            d.Destino,
                            d.Exportador,
                            d.BalanzaPuerto
                        })
                        .Select(g => new
                        {
                            Producto = g.Key.MaterialPuerto.Descripcion,
                            Bodega = g.Key.Bodega.Nombre.Replace("BODEGA ", "00"),
                            Exportador = g.Key.Exportador.Nombre,
                            Destino = g.Key.Destino.Nombre,
                            BalanzaPuerto = int.Parse(g.Key.BalanzaPuerto.CodigoBalanza),
                            CantidadTotal = g.Sum(d => d.Cantidad)
                        }).ToList();

                    foreach (var detalle in detalleAgrupado)
                    {
                        numeroComprobante++;

                        var comprobante = new RomaneoPuertoComprobante
                        {
                            NumeroComprobante = numeroComprobante,
                            Buque = buque,
                            Producto = detalle.Producto,
                            Bodega = detalle.Bodega,
                            Exportador = detalle.Exportador,
                            Destino = detalle.Destino,
                            Balanza = detalle.BalanzaPuerto,
                            Cantidad = detalle.CantidadTotal,
                            FechaCarga = turno.Fecha.Value.Date,
                            Turno = turno.TurnoPuerto.Orden,
                        };

                        romaneoPuerto.RomaneoPuertoComprobantes.Add(comprobante);
                    }
                }

                romaneoPuerto.CantidadPaginas = romaneoPuerto.RomaneoPuertoComprobantes.Count * 2;
                romaneoPuerto.FechaEmision = DateTime.Now;

                var logABM = new LogABM
                {
                    Pantalla = "GenerarRomaneoPuerto",
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = Dominio.Enums.EventoABM.Alta,
                    Entidad = $"Generación de romaneo para módulo de carga ID {moduloDeCarga.Id}"
                };

                parametro.Parametro3 = numeroComprobante.ToString().PadLeft(10, '0');

                Repositorio.Agregar(romaneoPuerto);
                Repositorio.Agregar(logABM);

                Repositorio.GuardarCambios();
                resultado.Id = romaneoPuerto.Id;
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al generar romaneo puerto {0}", e);
            }
            return resultado;
        }
    }
}
