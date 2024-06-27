using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorModificarDestinoPuerto : ProcesadorComando<ModificarDestinoPuerto>
    {
        public ProcesadorModificarDestinoPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(ModificarDestinoPuerto comando)
        {
            var resultado = new Resultado();
            try
            {
                var nombre = comando.Destino.Nombre.ToUpper();
                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = comando.ToJson(),
                    ClaseId = comando.Destino.Id
                };

                var destinoDb = Repositorio.Obtener<Destino>(comando.Destino.Id) ?? throw new Exception("No se encontró un destino con el id especificado");

                if (Repositorio.Existe<Destino>(d => d.Nombre.ToUpper() == nombre && d.Id != comando.Destino.Id && d.Activo))
                {
                    throw new Exception("El Nombre ingresado ya existe en otro destino");
                }

                var destinoInactivo = Repositorio.Obtener<Destino>(d => d.Nombre.ToUpper() == nombre && !d.Activo);
                if (destinoInactivo == null)
                {
                    destinoDb.Nombre = nombre;
                }
                else
                {
                    destinoInactivo.Activo = true;
                    var destinoInactivoJSON = Conversor.Convertir<Destino, DestinoDto>(destinoInactivo).ToJson();
                    logABM.Entidad = "REACTIVACIÓN " + destinoInactivoJSON;
                    logABM.ClaseId = destinoInactivo.Id;

                    destinoDb.Activo = false;
                    var destinoDbJSON = Conversor.Convertir<Destino, DestinoDto>(destinoDb).ToJson();
                    var logABM2 = new LogABM
                    {
                        Pantalla = comando.GetType().Name,
                        Usuario = comando.Usuario,
                        Fecha = DateTime.Now,
                        Evento = EventoABM.Baja,
                        Entidad = destinoDbJSON,
                        ClaseId = destinoDb.Id
                    };
                    Repositorio.Agregar(logABM2);
                }
                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al modificar destino {0}", e);
            }
            return resultado;
        }
    }
}
