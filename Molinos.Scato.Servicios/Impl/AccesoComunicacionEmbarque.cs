using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AfipWebService;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Impl
{
    public class AccesoComunicacionEmbarque: AccesoAFIP, IAccesoComunicacionEmbarque
    {
        public override string PathCertificado
        {
            get => ConfigurationManager.AppSettings["CertificadoWsComunicacionEmbarque"];
        }

        public AccesoComunicacionEmbarque(IServicioComandos servicioComandos, IRepositorio repositorio, LoginCMS serviceAfip, IServicioRepositorio servicio, ILogger log) :
          base(servicioComandos, repositorio, serviceAfip, servicio, log)
        {
        }

    }
}
