using System;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.ServicioImpresion;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorImprimirEtiquetaPuerto : ProcesadorComando<ImprimirEtiquetaPuerto>
    {
        private readonly IServicioImpresion servicioImpresion;
        public ProcesadorImprimirEtiquetaPuerto(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioImpresion servicioImpresion)
            : base(repositorio, conversor, log)
        {
            this.servicioImpresion = servicioImpresion;
        }

        public override Resultado Ejecutar(ImprimirEtiquetaPuerto comando)
        {
            try
            {
                var resultado = new Resultado();
                var etiquetas = comando.UsuarioId > 0 ? Repositorio.Listar<ImpEtiquetaPuerto>(x => x.Usuario_Id == comando.UsuarioId) : Repositorio.Listar<ImpEtiquetaPuerto>(x => x.Id == comando.Id);

                if (comando.ImpresoraId > 0)
                {
                    var impresora = Repositorio.Obtener<Impresora>(comando.ImpresoraId) ?? new Impresora { Direccion = "" };
                    comando.Impresora = impresora.Direccion;
                }

                foreach (var etiqueta in etiquetas)
                {
                    comando.Dto = new ImpEtiquetaPuertoDto { Id = etiqueta.Id, Vapor = etiqueta.Vapor, Cargador = etiqueta.Cargador, Mercaderia = etiqueta.Mercaderia, Destino = etiqueta.Destino, Kg = etiqueta.Kg, NumeroLote = etiqueta.NumeroLote, Bodega = etiqueta.Bodega, Control = etiqueta.Control, Fecha = etiqueta.Fecha, Usuario_Id = etiqueta.Usuario_Id, FechaCreacion = etiqueta.FechaCreacion };
                    var result = servicioImpresion.Ejecutar(comando);
                    if (result.HayErrores)
                        return result;
                    else
                        resultado = result;
                }

                return resultado;
            }
            catch (Exception e)
            {
                Log.Error(e, "Error al imprimir en la impresora: " + comando.Impresora);
                throw;
            }
        }
    }
}

