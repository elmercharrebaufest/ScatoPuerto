using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento.AfipPuerto
{
    public class ProcesadorAfipRectificarCoem : ProcesadorComando<AfipRectificarCoem>
    {
        public ProcesadorAfipRectificarCoem(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }
        public override Resultado Ejecutar(AfipRectificarCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coem = comando.Dto;
               
                var contenedoresConCargaDB = Repositorio.Listar<AfipCoemContenedorConCarga>(x => x.AfipCoem.Id == coem.Id);
                //foreach (var contenedor in contenedoresConCarga) Repositorio.Remover(contenedor);
                var contenedoresVaciosDB = Repositorio.Listar<AfipCoemContenedorVacio>(x => x.AfipCoem.Id == coem.Id);
                //foreach (var contenedor in contenedoresVacios) Repositorio.Remover(contenedor);
                var mercaderiasSueltasDB = Repositorio.Listar<AfipCoemMercaderiaSuelta>(x => x.AfipCoem.Id == coem.Id);
                //foreach (var mercaderia in mercaderiasSueltas) Repositorio.Remover(mercaderia);

                var coemDb = Repositorio.Obtener<AfipCoem>(coem.Id);
                if (coemDb == null)
                {
                    throw new Exception("No existe la COEM con el id especificado");
                }

                var contenedoresConCarga = this.Conversor.ConvertirList<AfipCoemContenedorConCargaDto, AfipCoemContenedorConCarga>(coem.ContenedoresConCarga);
                contenedoresConCargaDB = contenedoresConCarga;

                var contenedoresVacios = this.Conversor.ConvertirList<AfipCoemContenedorVacioDto, AfipCoemContenedorVacio>(coem.ContenedoresVacios);
                contenedoresVaciosDB = contenedoresVacios;

                var mercaderiasSueltas = this.Conversor.ConvertirList<AfipCoemMercaderiaSueltaDto, AfipCoemMercaderiaSuelta>(coem.MercaderiasSueltas);
                mercaderiasSueltasDB = mercaderiasSueltas;

                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                Log.Error("Error al rectificar Coem {0}", ex.StackTrace);
                throw ex;
            }
            return resultado;
        }
    }
}
