using System;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearBodega : ProcesadorCrear<CrearBodega, Bodega>
    {
        public ProcesadorCrearBodega(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override Bodega CrearEntidad(CrearBodega comando)
        {
            return Conversor.Convertir<BodegaDto, Bodega>(comando.Dto);
        }

        protected override void Validar(CrearBodega comando, Resultado resultado)
        {
            if (Repositorio.Existe<Bodega>(e => e.Nombre == comando.Dto.Nombre))
            {
                resultado.Error("Descripcion", Textos.Error_Existente);
            }
        }

        protected override void Finally(CrearBodega comando, int id)
        {
            var logABM = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Alta,
                Entidad = comando.ToJson(),
                ClaseId = id
            };
            Repositorio.Agregar(logABM);
            Repositorio.GuardarCambios();
        }
    }
}
