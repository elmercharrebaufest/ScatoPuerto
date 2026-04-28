using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.AFIP;
using Molinos.Scato.Servicios.Impl;
using Ninject.Modules;
using System.Configuration;
using System.Linq;
using System.Reflection;

namespace Molinos.Scato.Dependencias
{
    public class WebPuertoNinjectModule : NinjectModule
    {
        public override void Load()
        {
            Bind(typeof(IServicioActividadFactory<>)).To(typeof(ServicioActividadFactory<>)).InSingletonScope();
            this.BindChannelFactory<IServicioRepositorio>("ServicioRepositorio");
            this.BindChannelFactory<IServicioComandos>("ServicioComandos");
            this.BindChannelFactory<IListaDeWorkflows>("ListaDeWorkflows");
            this.BindChannelFactory<IFirmaProvider>("FirmaProvider");
            this.BindChannelFactory<IServicioProgramaEmbarque>("ServicioProgramaEmbarque");
            this.BindChannelFactory<IServicioVapor>("ServicioVapor");
            this.BindChannelFactory<IServicioAfip>("ServicioAfip");
            this.BindChannelFactory<IServicioClientes>("ServicioClientes");
            this.BindChannelFactory<IServicioDocumento>("ServicioDocumento");
            this.BindChannelFactory<IServicioAdministracion>("ServicioAdministracion");
            this.BindChannelFactory<IServicioComprobante>("ServicioComprobante");
            this.BindChannelFactory<IServicioCargaOtrosMuelles>("ServicioCargaOtrosMuelles");
            BindServiciosActividad();
        }

        private void BindServiciosActividad()
        {
            // Hace el binding de todas las interfaces de actividades
            var servicios = typeof(ICaladoService).Assembly.GetTypes()
                                                   .Where(t => t.Namespace == typeof(ICaladoService).Namespace);

            var metodo = typeof(ExtensionesNinject).GetMethod("BindWorkflowChannelFactory",
                                                               BindingFlags.NonPublic | BindingFlags.Static);

            foreach (var servicio in servicios)
            {
                metodo.MakeGenericMethod(servicio).Invoke(null, new object[] { this });
            }
        }
    }
}
