using System;
using System.Collections.Generic;
using System.Linq;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
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
                var tipoComprobante = Repositorio.Obtener<TipoComprobante>(tc => tc.Descripcion == "Romaneo") ?? throw new Exception("No existe el tipo de comprobante \"Romaneo\" en la base de datos");
                var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.ModuloDeCargaId) ?? throw new Exception("No se encontró el módulo de carga especificado.");

                var tieneDetallesSolidos = moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Any(t => t.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Any());
                if (!tieneDetallesSolidos)
                {
                    throw new Exception("No existen cargas para generar el romaneo.");
                }

                var buque = Repositorio.Incluir<LineUp>().Where(l => l.ModuloDeCarga.Id == comando.ModuloDeCargaId).Select(l => l.Embarque.Vapor.Nombre).FirstOrDefault();
                var cantidadRomaneos = Repositorio.Contar<ComprobanteDeEmbarque>(r => r.ModuloDeCarga.Id == comando.ModuloDeCargaId);
                var parametro = Repositorio.Obtener<Parametros>(p => p.Descripcion == "NumeroInicioComprobante") ?? throw new Exception("No se encontró el parámetro NumeroInicioComprobante.");

                int numeroComprobante = int.Parse(parametro.Parametro3);

                var romaneoPuerto = new ComprobanteDeEmbarque
                {
                    Buque = buque,
                    UsuarioEmision = comando.Usuario,
                    ModuloDeCarga = moduloDeCarga,
                    TipoComprobante = tipoComprobante,
                    NumeroComprobante = cantidadRomaneos + 1,
                    ComprobanteDeEmbarqueDetalles = new List<ComprobanteDeEmbarqueDetalle>(),
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

                        var comprobante = new ComprobanteDeEmbarqueDetalle
                        {
                            NumeroComprobante = numeroComprobante,
                            Producto = detalle.Producto,
                            Bodega = detalle.Bodega,
                            Exportador = detalle.Exportador,
                            Destino = detalle.Destino,
                            Balanza = detalle.BalanzaPuerto,
                            Cantidad = detalle.CantidadTotal,
                            FechaCarga = turno.Fecha.Value.Date,
                            Turno = turno.TurnoPuerto.Orden,
                        };

                        romaneoPuerto.ComprobanteDeEmbarqueDetalles.Add(comprobante);
                    }
                }

                romaneoPuerto.CantidadPaginas = romaneoPuerto.ComprobanteDeEmbarqueDetalles.Count * 2;
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
