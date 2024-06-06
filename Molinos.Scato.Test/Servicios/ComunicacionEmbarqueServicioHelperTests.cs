using FluentAssertions;
using log4net;
using log4net.Config;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.AFIP;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Impl;
using Molinos.Scato.Test.Mock;
using Moq;
using Ninject;
using Ninject.Extensions.Logging;
using Ninject.Extensions.Logging.Log4net;
using Ninject.Modules;
using NUnit.Framework;
using System;
using System.IO;
using System.Reflection;

namespace Molinos.Scato.Test.Servicios
{
    public class ComunicacionEmbarqueServicioHelperTests
    {
        private Mock<IAccesoComunicacionEmbarque> _mockAcceso;
        private Mock<wgescomunicacionembarqueSoap> _mockWebService;
        private Mock<IConversor> _mockConversor;
        private ILogger _logger;
        private Mock<IAfipClient> _mockAfipClient;
		private Mock<IServicioRepositorio> _mockServicioRepositorio;
		// Otros mocks necesarios

		private ComunicacionEmbarqueServicioHelper servicioHelper;

        [SetUp]
        public void Setup()
        {
            _mockAcceso = new Mock<IAccesoComunicacionEmbarque>();
            _mockWebService = new Mock<wgescomunicacionembarqueSoap>();
            _mockConversor = new Mock<IConversor>();
            _mockAfipClient = new Mock<IAfipClient>();
			_mockServicioRepositorio = new Mock<IServicioRepositorio>();

			_mockAcceso.Setup(s => s.Obtener(It.IsAny<string>(), It.IsAny<Resultado>(), It.IsAny<string>())).Returns(new TicketAccesoAfip());
            var a = Path.GetFullPath("log4net.config");
            Console.WriteLine(Path.GetFullPath("log4net.config"));

            _logger = ConfigureLog();

            servicioHelper = new ComunicacionEmbarqueServicioHelper(_mockAcceso.Object,
                _mockWebService.Object,
                _mockConversor.Object,
                _logger,
                _mockAfipClient.Object,
				_mockServicioRepositorio.Object);
        }

        [Ignore]
        private ILogger ConfigureLog()
        {
            var logRepository = LogManager.GetRepository(Assembly.GetCallingAssembly());
            XmlConfigurator.Configure(logRepository, new FileInfo("log4net.config"));
            IKernel kernel = new StandardKernel();
            kernel.Bind<NinjectModule>().To<Log4NetModule>().InSingletonScope();
            var loggerFactory = kernel.Get<Ninject.Extensions.Logging.ILoggerFactory>();
            return loggerFactory.GetCurrentClassLogger();
        }

        [Test]
        public void RegistrarCaratula_Ok()
        {
            // Arrange
            var dto = new AfipCaratulaDto();
            var respuestaEsperada = new RegistrarCaratulaResponse();

            _mockConversor.Setup(co => co.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.RegistrarCaratula(It.IsAny<RegistrarCaratulaRequest1>()))
                .Returns(respuestaEsperada);
            _mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
                .Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.RegistrarCaratula(dto);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void RectificarCaratula_Ok()
        {
            // Arrange
            var dto = new AfipCaratulaDto();
            var respuestaEsperada = new RectificarCaratulaResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.RectificarCaratula(It.IsAny<RectificarCaratulaRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.RectificarCaratula(dto);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void AnularCaratula_Ok()
        {
            // Arrange
            var identificadorCaratula = string.Empty;
            var respuestaEsperada = new AnularCaratulaResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.AnularCaratula(It.IsAny<AnularCaratulaRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.AnularCaratula(identificadorCaratula);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void RegistrarCOEM_Ok()
        {
            // Arrange
            var dto = new AfipCoemDto();
            var respuestaEsperada = new RegistrarCOEMResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.RegistrarCOEM(It.IsAny<RegistrarCOEMRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.RegistrarCOEM(dto);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void RectificarCOEM_Ok()
        {
            // Arrange
            var dto = new AfipCoemDto();
            var respuestaEsperada = new RectificarCOEMResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.RectificarCOEM(It.IsAny<RectificarCOEMRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.RectificarCOEM(dto);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void AnularCOEM_Ok()
        {
            // Arrange
            var identificadorCaratula = string.Empty;
            var identificadorCOEM = string.Empty;
            var respuestaEsperada = new AnularCOEMResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.AnularCOEM(It.IsAny<AnularCOEMRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.AnularCOEM(identificadorCaratula, identificadorCOEM);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void CerrarCOEM_Ok()
        {
            // Arrange
            var identificadorCaratula = string.Empty;
            var identificadorCOEM = string.Empty;
            var respuestaEsperada = new CerrarCOEMResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.CerrarCOEM(It.IsAny<CerrarCOEMRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.CerrarCOEM(identificadorCaratula, identificadorCOEM);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void SolicitarAnulacionCOEM_Ok()
        {
            // Arrange
            var identificadorCaratula = string.Empty;
            var identificadorCOEM = string.Empty;
            var respuestaEsperada = new SolicitarAnulacionCOEMResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.SolicitarAnulacionCOEM(It.IsAny<SolicitarAnulacionCOEMRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.SolicitarAnulacionCOEM(identificadorCaratula, identificadorCOEM);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void SolicitarCierreCargaGranel_Ok()
        {
            // Arrange
            var dto = new AfipSolicitarCierreCargaGranelDto();
            var respuestaEsperada = new SolicitarCierreCargaGranelResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.SolicitarCierreCargaGranel(It.IsAny<SolicitarCierreCargaGranelRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.SolicitarCierreCargaGranel(dto);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }

        [Test]
        public void SolicitarNoAbordo_Ok()
        {
            // Arrange
            var identificadorCaratula = string.Empty;
            var identificadorCOEM = string.Empty;
            var identificadoresDeclaracionesMercaderiaSuelta = new Declaracion[1];
            var codigoMotivo = string.Empty;
            var descripcionMotivo = string.Empty;
            var respuestaEsperada = new SolicitarNoABordoResponse();

            _mockConversor.Setup(c => c.Convertir<AfipCaratulaDto, Caratula>(It.IsAny<AfipCaratulaDto>()))
                .Returns(new Caratula());
            _mockWebService.Setup(ws => ws.SolicitarNoABordo(It.IsAny<SolicitarNoABordoRequest1>()))
                .Returns(respuestaEsperada);
			_mockAfipClient.Setup(ac => ac.GetTicketAccesoAfip())
				.Returns(FakeComunicacionEmbarqueServicioHelper.GenerateResponseTicketAccesoAfip());

			// Act
			var resultado = servicioHelper.SolicitarNoAbordo(identificadorCaratula, identificadorCOEM, identificadoresDeclaracionesMercaderiaSuelta, codigoMotivo, descripcionMotivo);

            // Assert
            resultado.Should().NotBeNull();
            resultado.Should().Equals(respuestaEsperada);
        }
    }
}