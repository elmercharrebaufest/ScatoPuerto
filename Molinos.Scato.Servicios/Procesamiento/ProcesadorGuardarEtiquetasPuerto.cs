using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarEtiquetasPuerto : ProcesadorCrear<GuardarEtiquetaPuerto, ImpEtiquetaPuerto>
    {
        public ProcesadorGuardarEtiquetasPuerto(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override ImpEtiquetaPuerto CrearEntidad(GuardarEtiquetaPuerto comando)
        {
            try
            {
                var dto = comando.Etiqueta;

                return new ImpEtiquetaPuerto
                {
                    Vapor = dto.Vapor,
                    Cargador = dto.Cargador,
                    Mercaderia = dto.Mercaderia,
                    Destino = dto.Destino,
                    Kg = dto.Kg,
                    NumeroLote = dto.NumeroLote,
                    Bodega = dto.Bodega,
                    Control = dto.Control,
                    Fecha = dto.Fecha,
                    Usuario = dto.Usuario,
                    FechaCreacion = DateTime.Now
                };
            }
            catch (Exception ex)
            {
                throw new CrearException(ex.InnerException?.Message ?? ex.Message);
            }
        }

        protected override void Validar(GuardarEtiquetaPuerto comando, Resultado resultado)
        {
            //if(Repositorio.Existe<ImpEtiquetaPuerto>(x => x.Vapor == comando.Etiqueta.Vapor))
            //{
            //    resultado.Error("", "Ya existe una etiqueta para el vapor " + comando.Etiqueta.Vapor);
            //}
        }
    }
}
