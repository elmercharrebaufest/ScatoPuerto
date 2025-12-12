using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.AfipCPDigitalService;
using Molinos.Scato.Servicios.AfipWebService;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Conversiones.Impl;
using Molinos.Scato.Servicios.GestionarCartasDePortePE;
using Molinos.Scato.Servicios.Impl;
using Molinos.Scato.Servicios.Orquestador;
using Molinos.Scato.Servicios.ServicioImpresion;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Servicios.Urenport;
using Ninject.Modules;
using System.Data.Entity;
using System.Net.Http;
using System.ServiceModel;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.AFIPServicioConsultaComunicacionEmbarque;
using Molinos.Scato.Servicios.AFIP;
using Molinos.Scato.Servicios.Estrategias;

namespace Molinos.Scato.Dependencias
{
    public class ServiciosWebNinjectModule : NinjectModule
    {
        public override void Load()
        {
            Bind<DbContext>().To<ScatoDbContext>().InScope(ctx => OperationContext.Current);
            Bind<IRepositorio>().To<RepositorioEF>().InScope(ctx => OperationContext.Current);

            Bind<IConversor>().To<ConversorAutoMapper>().InSingletonScope();

            Bind<IServicioRepositorio, ServicioRepositorio>().To<ServicioRepositorio>().InScope(ctx => OperationContext.Current);
            Bind<IServicioWorkflows, ServicioWorkflows>().To<ServicioWorkflows>().InScope(ctx => OperationContext.Current);
            Bind<IServicioComandos, ServicioComandos>().To<ServicioComandos>().InSingletonScope();
            Bind<IServicioSapAsincronico, ServicioSapAsincronico>().To<ServicioSapAsincronico>().InScope(ctx => OperationContext.Current);
            Bind<IConfiguracionProvider, ConfiguracionProvider>().To<ConfiguracionProvider>().InSingletonScope();
            Bind<IAccesoComunicacionEmbarque, AccesoComunicacionEmbarque>().To<AccesoComunicacionEmbarque>();
            Bind<IComunicacionEmbarqueServicioHelper, ComunicacionEmbarqueServicioHelper>().To<ComunicacionEmbarqueServicioHelper>();
            Bind<IConsultaComunicacionEmbarqueServicioHelper, ConsultaComunicacionEmbarqueServicioHelper>().To<ConsultaComunicacionEmbarqueServicioHelper>();
            Bind<IFirmaProvider, FirmaProvider>().To<FirmaProvider>().InSingletonScope();
            Bind<IServicioImpresorFactory, ServicioImpresorFactory>().To<ServicioImpresorFactory>().InSingletonScope();
            Bind<IServicioMercadoPago, ServicioMercadoPago>().To<ServicioMercadoPago>().InScope(ctx => OperationContext.Current);
            Bind<IServicioCircular, ServicioCircular>().To<ServicioCircular>().InScope(ctx => OperationContext.Current);
            Bind<HttpClient>().ToSelf().InSingletonScope();
            Bind<IAdministradorDeCalles, AdministradorDeCalles>().To<AdministradorDeCalles>().InScope(ctx => OperationContext.Current);
            Bind<IServicioProgramaEmbarque, ServicioProgramaEmbarque>().To<ServicioProgramaEmbarque>().InScope(ctx => OperationContext.Current);
            Bind<IServicioVapor, ServicioVapor>().To<ServicioVapor>().InScope(ctx => OperationContext.Current);
            Bind<IServicioAfip, ServicioAfip>().To<ServicioAfip>().InScope(ctx => OperationContext.Current);
            Bind<IServicioClientes, ServicioClientes>().To<ServicioClientes>().InScope(ctx => OperationContext.Current);
            Bind<IServicioDocumento, ServicioDocumento>().To<ServicioDocumento>().InScope(ctx => OperationContext.Current);
            Bind<IServicioAdministracion, ServicioAdministracion>().To<ServicioAdministracion>().InScope(ctx => OperationContext.Current);
            Bind<IServicioComprobante, ServicioComprobante>().To<ServicioComprobante>().InScope(ctx => OperationContext.Current);
            Bind<IAfipClient, AfipClient>().To<AfipClient>();

            this.BindChannelFactory<IServicioNotificarUsuario>("ServicioNotificarUsuario");
            Bind<IServicioEstadoPuesto, ServicioEstadoPuesto>().To<ServicioEstadoPuesto>().InSingletonScope();

            this.BindChannelFactory<wgescomunicacionembarqueSoap>("ComunicacionEmbarque");
            this.BindChannelFactory<wconscomunicacionembarqueSoap>("ConsultaComunicacionEmbarque");
            this.BindChannelFactory<LoginCMS>("LoginCms");
            this.BindChannelFactory<ZSDWS_SCATO>("ZSDWS_SCATO", "SapServiceUsername", "SapServicePassword");
            this.BindChannelFactory<WaybillManagementPODv2>("WaybillManagementPODImplPort", "MonsantoServiceUsername", "MonsantoServicePassword");
            this.BindChannelFactory<calpesSoap>("calpesSoap");
            this.BindChannelFactory<IServicioOrquestador>("Orquestador");
            this.BindChannelFactory<IServicioImpresion>("ServicioImpresion");

            this.BindChannelFactory<CpePortType>("CpeEndPoint");

            Bind<IBalanzadaContext>().To<BalanzadaContext>().InTransientScope();
            Bind<IBalanzadaStrategy>().To<BalanzadaStrategy>().InTransientScope();
            Bind<IBalanzadaStrategy>().To<BalanzadaInicioStrategy>().InTransientScope();
            Bind<IBalanzadaStrategy>().To<BalanzadaErrorStrategy>().InTransientScope();
            Bind<IBalanzadaStrategy>().To<BalanzadaFinStrategy>().InTransientScope();
            Bind<IServicioCarga, ServicioCarga>().To<ServicioCarga>().InScope(ctx => OperationContext.Current);
            Bind<IServicioTurno, ServicioTurno>().To<ServicioTurno>().InScope(ctx => OperationContext.Current);
        }
    }
}