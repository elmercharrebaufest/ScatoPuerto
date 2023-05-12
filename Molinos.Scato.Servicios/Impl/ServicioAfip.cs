using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using NPOI.Util;
using System;
using System.Collections.Generic;
using System.DirectoryServices;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using Molinos.Scato.Dominio.Comandos;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioAfip : IServicioAfip
    {
        private readonly IRepositorio repositorio;
        private readonly IConversor conversor;
        private readonly ILogger log;
        private readonly IServicioComandos comandos;

        public ServicioAfip(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioComandos comandos)
        {
            this.repositorio = repositorio;
            this.conversor = conversor;
            this.log = log;
            this.comandos = comandos;
        }

        public IList<AfipCaratulaDto> ListarCaratulas()
        {
            return new List<AfipCaratulaDto>();
        }

        public AfipCaratulaDto ObtenerCaratula(string id)
        {
            return new AfipCaratulaDto();
        }

        public string RegistrarCaratula(AfipCaratulaDto caratula)
        {
            // TODO: Rectificar si tiene ID
            return "";
        }

        public void AnularCaratula(string id) { }

        public void SolicitarCambioBuque(object cambioBuque) { }

        public void SolicitarCambioFechas(object cambioFechas) { }

        public void SolicitarCambioLOT(object cambioLOT) { }
    }
}
