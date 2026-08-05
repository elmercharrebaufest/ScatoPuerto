using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Orquestador;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearBalanzaPuerto : ProcesadorCrear<CrearBalanzaPuerto, BalanzaPuerto>
    {
        private readonly IServicioOrquestador orquestador;
        private readonly IConfiguracionProvider config;

        public ProcesadorCrearBalanzaPuerto(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioOrquestador orquestador, IConfiguracionProvider config)
            : base(repositorio, conversor, log)
        {
            this.orquestador = orquestador;
            this.config = config;
        }


        protected override BalanzaPuerto CrearEntidad(CrearBalanzaPuerto comando)
        {
            var entidad = Conversor.Convertir<BalanzaPuertoDto, BalanzaPuerto>(comando.Dto);
            entidad.Centro = Repositorio.Obtener<Centro>(comando.Dto.CentroId);
            Suscribir(comando.Dto.CodigoBalanza);

            return entidad;
        }

        protected override void Validar(CrearBalanzaPuerto comando, Resultado resultado)
        {
            if (Repositorio.Existe<BalanzaPuerto>(e => e.CodigoDispositivo == comando.Dto.CodigoDispositivo && (comando.Dto.Id == 0 || e.Id != comando.Dto.Id)))
            {
                resultado.Error("CrearBalanzaPuerto", "Ya existe una balanza con el mismo codigo de dispositivo, verifique.");
            }
        }


        protected override void Finally(CrearBalanzaPuerto comando, int id)
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

        private void Suscribir(string codigoDispositivo)
        {
            try
            {
                orquestador.Suscribir(new ComandoSuscribir
                {
                    CodigoDispositivo = codigoDispositivo,
                    CodigoEvento = "BalanzadaRecibida",
                    RutaAccesoSuscriptor = config.AppSettings["UrlNotificaciones"],
                    Persistente = true
                });
            }
            catch (Exception e)
            {
                Log.Error("Error al suscribir balanza de puerto: ",e);
            }
        }
    }
}
