using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
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
    public class ProcesadorCrearDestinoPuerto : ProcesadorComando<CrearDestinoPuerto>
    {
        public ProcesadorCrearDestinoPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(CrearDestinoPuerto comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var nombre = comando.Nombre.ToUpper();
                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Alta,
                    Entidad = nombre
                };

                var destinoDb = Repositorio.Obtener<Destino>(d => d.Nombre.ToUpper() == nombre);
                if (destinoDb == null)
                {
                    destinoDb = new Destino { Nombre = nombre, Activo = true };
                    Repositorio.Agregar(destinoDb);
                }
                else
                {
                    if (destinoDb.Activo)
                    {
                        throw new Exception("El Nombre ingresado ya existe en otro destino");
                    }
                    logABM.Entidad = "REACTIVACION " + logABM.Entidad;
                    destinoDb.Activo = true;
                }
                Repositorio.GuardarCambios();

                logABM.ClaseId = destinoDb.Id;
                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al crear destino {0}", e);
            }
            return resultado;
        }
    }
}
