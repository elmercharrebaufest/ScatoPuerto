using Molinos.Scato.Dominio.Comandos;
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
    public class ProcesadorModificarBalanzaPuerto : ProcesadorModificar<ModificarBalanzaPuerto>
    {
        private readonly IServicioOrquestador orquestador;
        private readonly IConfiguracionProvider config;

        public ProcesadorModificarBalanzaPuerto(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioOrquestador orquestador, IConfiguracionProvider config)
            : base(repositorio, conversor, log)
        {
            this.orquestador = orquestador;
            this.config = config;
        }

        public override Resultado Ejecutar(ModificarBalanzaPuerto comando)
        {
            var resultado = base.Ejecutar(comando);
            if (!resultado.HayErrores)
            {
                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = comando.ToJson(),
                    ClaseId = comando.Dto.Id
                };
                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            return resultado;
        }

        protected override void ModificarEntidad(ModificarBalanzaPuerto comando)
        {
            var balanzaPuerto = Repositorio.Obtener<BalanzaPuerto>(comando.Dto.Id);
            Conversor.Convertir(comando.Dto, balanzaPuerto);
            balanzaPuerto.Centro = Repositorio.Obtener<Centro>(comando.Dto.CentroId);
            Suscribir(comando.Dto.CodigoBalanza);
        }

        protected override void Validar(ModificarBalanzaPuerto comando, Resultado resultado)
        {
            if (Repositorio.Existe<BalanzaPuerto>(e => e.CodigoDispositivo == comando.Dto.CodigoDispositivo && (comando.Dto.Id == 0 || e.Id != comando.Dto.Id)))
            {
                resultado.Error("ModificarBalanzaPuerto", string.Format(Textos.Error_ActualizarGenerico));
            }
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
                Log.Error("Error al suscribir balanza de puerto: ", e);
            }
        }
    }
}
