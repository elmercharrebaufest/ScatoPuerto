using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorActualizarCartasLineUp : ProcesadorComando<ActualizarCartasLineUp>
    {
        public ProcesadorActualizarCartasLineUp(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(ActualizarCartasLineUp comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var lineup = Repositorio.Obtener<LineUp>(x => x.Id == comando.LineUp.Id);

                lineup.CartaDeSubidaEnviada = comando.LineUp.CartaDeSubidaEnviada;
                lineup.CartaDeSubidaAprobada = comando.LineUp.CartaDeSubidaAprobada;
                lineup.CargaEnSap = comando.LineUp.CargaEnSap;
                lineup.NominacionDePractico = comando.LineUp.NominacionDePractico;
                lineup.SeguridadPortuaria = comando.LineUp.SeguridadPortuaria;
                lineup.InspeccionSenasa = comando.LineUp.InspeccionSenasa;
                lineup.ControlSenasa = comando.LineUp.ControlSenasa;
                lineup.ControlPrivado = comando.LineUp.ControlPrivado;
                lineup.Amarrador = comando.LineUp.Amarrador;
                lineup.AgenciaContactada = comando.LineUp.AgenciaContactada;
                lineup.PlanoDeCargaEnviado = comando.LineUp.PlanoDeCargaEnviado;
                lineup.Orden = comando.LineUp.Orden;
                lineup.Embarque.Ubicacion = comando.LineUp.Ubicacion;
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.OrdenCargaInterna_Error);
            }

            return resultado;
        }
    }
}