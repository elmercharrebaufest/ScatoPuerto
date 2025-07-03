using FluentAssertions;
using log4net;
using log4net.Config;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Servicios.Impl;
using Molinos.Scato.Test.Mock;
using Moq;
using Ninject;
using Ninject.Extensions.Logging;
using Ninject.Extensions.Logging.Log4net;
using Ninject.Modules;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

namespace Molinos.Scato.Test.Servicios
{
    public class ServicioAfipTest
    {
        private Mock<IRepositorio> _mockRepositorio;
        private Mock<IConversor> _mockConversor;
        private Mock<IServicioComandos> _mockServicioComandos;
        private Mock<IServicioRepositorio> _mockServicioRepositorio;
        private ServicioAfip _servicioAfip;
        private ILogger _logger;

        [SetUp]
        public void Setup()
        {
            _mockRepositorio = new Mock<IRepositorio>();
            _mockConversor = new Mock<IConversor>();
            _mockServicioComandos = new Mock<IServicioComandos>();
            _mockServicioRepositorio = new Mock<IServicioRepositorio>();

            _logger = ConfigureLog();

            _servicioAfip = new ServicioAfip(
                _mockRepositorio.Object,
                _mockConversor.Object,
                _logger,
                _mockServicioComandos.Object,
                _mockServicioRepositorio.Object
            );
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
        public void ListarCaratulas_ReturnsExpectedResults()
        {
            // Arrange
            var paginacion = new Paginacion(null, DirOrden.Asc, 1, 10);
            var listaPaginada = new ListaPaginada<AfipCaratula>(FakeAfipCaratula.FakeListSolido(15), 1, 10, 15);
            _mockRepositorio.Setup(repo => repo.ListarConsultaPaginada(It.IsAny<ListarAfipCaratulaConsulta>()))
                .Returns(listaPaginada);
            _mockConversor.Setup(conv => conv.ConvertirListaPaginada<AfipCaratula, AfipCaratulaDto>(It.IsAny<ListaPaginada<AfipCaratula>>()))
                .Returns(new ListaPaginada<AfipCaratulaDto>(FakeAfipCaratulaDto.FakeListDtoSolido(15), 1, 10, 15));

            // Act
            var result = _servicioAfip.ListarCaratulas(paginacion);

            // Assert
            result.Should().NotBeNull();
            result.Items.Should().NotBeNull().And.HaveCount(15);
            result.Pagina.Should().Be(1);
            result.ItemsPorPagina.Should().Be(10);
            result.ItemsTotales.Should().Be(15);
        }

        [Test]
        public void ObtenerCaratula_ReturnsExpectedResult()
        {
            // Arrange
            _mockRepositorio.Setup(repo => repo.Obtener<AfipCaratula>(It.IsAny<int>()))
                .Returns(new AfipCaratula());
            _mockConversor.Setup(conv => conv.Convertir<AfipCaratula, AfipCaratulaDto>(It.IsAny<AfipCaratula>()))
                .Returns(FakeAfipCaratulaDto.FakeItemDtoSolido);

            // Act
            var result = _servicioAfip.ObtenerCaratula(1);

            // Assert
            result.Should().NotBeNull();
        }

        [Test]
        public void RegistrarCaratula_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var dto = new AfipRegistrarCaratulaDto();
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipRegistrarCaratula>())).Returns(resultado);

            // Act
            var result = _servicioAfip.RegistrarCaratula(dto, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void RegistrarCaratula_ThrowsException_WhenErrors()
        {
            // Arrange
            var dto = new AfipRegistrarCaratulaDto();
            var resultado = new Resultado();
            resultado.Error("", "Error");
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipRegistrarCaratula>())).Returns(resultado);

            // Act
            Action act = () => _servicioAfip.RegistrarCaratula(dto, "test");

            // Assert
            act.Should().Throw<Exception>().WithMessage("Error");
        }

        [Test]
        public void RectificarCaratula_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var dto = new AfipRectificarCaratulaDto();
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipRectificarCaratula>())).Returns(resultado);

            // Act
            var result = _servicioAfip.RectificarCaratula(dto, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void RectificarCaratula_ThrowsException_WhenErrors()
        {
            // Arrange
            var dto = new AfipRectificarCaratulaDto();
            var resultado = new Resultado();
            resultado.Error("", "Error");
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipRectificarCaratula>())).Returns(resultado);

            // Act
            Action act = () => _servicioAfip.RectificarCaratula(dto, "test");

            // Assert
            act.Should().Throw<Exception>().WithMessage("Error");
        }

        [Test]
        public void AnularCaratula_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var id = 1;
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipAnularCaratula>())).Returns(resultado);

            // Act
            var result = _servicioAfip.AnularCaratula(id, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void AnularCaratula_ThrowsException_WhenErrors()
        {
            // Arrange
            var id = 1;
            var resultado = new Resultado();
            resultado.Error("", "Error");
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipAnularCaratula>())).Returns(resultado);

            // Act
            Action act = () => _servicioAfip.AnularCaratula(id, "test");

            // Assert
            act.Should().Throw<Exception>().WithMessage("Error");
        }

        [Test]
        public void ListarCoems_ReturnsExpectedResults()
        {
            // Arrange
            var paginacion = new Paginacion(null, DirOrden.Asc, 1, 10);
            var listaPaginada = new ListaPaginada<AfipCoem>(FakeAfipCoem.FakeList(12), 1, 10, 15);
            _mockRepositorio.Setup(repo => repo.ListarConsultaPaginada(It.IsAny<ListarAfipCoemConsulta>()))
                .Returns(listaPaginada);
            _mockConversor.Setup(conv => conv.ConvertirListaPaginada<AfipCoem, AfipCoemDto>(It.IsAny<ListaPaginada<AfipCoem>>()))
                .Returns(new ListaPaginada<AfipCoemDto>(FakeAfipCoemDto.FakeList(12), 1, 10, 12));

            // Act
            var result = _servicioAfip.ListarCoems(1, paginacion, "", "", "");

            // Assert
            result.Should().NotBeNull();
            result.Items.Should().NotBeNull().And.HaveCount(12);
            result.Pagina.Should().Be(1);
            result.ItemsPorPagina.Should().Be(10);
            result.ItemsTotales.Should().Be(12);
        }

        [Test]
        public void ObtenerCoem_ReturnsExpectedResult()
        {
            // Arrange
            _mockRepositorio.Setup(repo => repo.Obtener<AfipCoem>(It.IsAny<int>()))
                .Returns(new AfipCoem());
            _mockConversor.Setup(conv => conv.Convertir<AfipCoem, AfipCoemDto>(It.IsAny<AfipCoem>()))
                .Returns(FakeAfipCoemDto.FakeItem);

            // Act
            var result = _servicioAfip.ObtenerCoem(1);

            // Assert
            result.Should().NotBeNull();
        }

        [Test]
        public void RegistrarCoem_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var dto = new AfipCoemRegistrarRequest();
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipRegistrarCoem>())).Returns(resultado);

            // Act
            var result = _servicioAfip.RegistrarCoem(dto, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void RectificarCoem_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var dto = new AfipCoemDto();
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipRectificarCoem>())).Returns(resultado);

            // Act
            var result = _servicioAfip.RectificarCoem(dto, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void AnularCoem_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipAnularCoem>())).Returns(resultado);

            // Act
            var result = _servicioAfip.AnularCoem(1, 1, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void CerrarCoem_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipCerrarCoem>())).Returns(resultado);

            // Act
            var result = _servicioAfip.CerrarCoem(1, 1, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void SolicitarAnulacionCoem_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipSolicitarAnulacionCoem>())).Returns(resultado);

            // Act
            var result = _servicioAfip.SolicitarAnulacionCoem(1, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void ListarCode_ReturnsExpectedResults()
        {
            var afipCodes = new List<AfipCode>();
            var afipCodeDtos = new List<AfipCodeDto> { new AfipCodeDto() };
            _mockConversor.Setup(c => c.ConvertirList<AfipCode, AfipCodeDto>(It.IsAny<List<AfipCode>>())).Returns(afipCodeDtos);

            // Act
            var result = _servicioAfip.ListarCode();

            // Assert
            result.Should().NotBeNull();
        }

        [Test]
        public void ObtenerCode_ReturnsExpectedResult()
        {
            // Arrange
            var afipCode = new AfipCode();
            var afipCodeDto = new AfipCodeDto();
            int id = 1;
            _mockRepositorio.Setup(r => r.Obtener<AfipCode>(id)).Returns(afipCode);
            _mockConversor.Setup(c => c.Convertir<AfipCode, AfipCodeDto>(afipCode)).Returns(afipCodeDto);

            // Act
            var result = _servicioAfip.ObtenerCode(id);

            // Assert
            result.Should().NotBeNull();
        }

        [Test]
        public void RegistrarCode_ReturnsTrue_WhenNoErrors()
        {
            // Arrange
            var afipCodeDto = new AfipCodeDto();
            var request = new AfipRegistrarCode { Dto = afipCodeDto };

            // Act
            _servicioAfip.RegistrarCode(afipCodeDto);

            // Assert
            _mockServicioComandos.Verify(s => s.Ejecutar(It.IsAny<AfipRegistrarCode>()));
        }

        [Test]
        public void SolicitarCierreCargaGranel_ShouldReturnTrue_WhenNoErrors()
        {
            // Arrange
            var dto = new AfipSolicitarCierreCargaGranelDto();
            var resultado = new Resultado();
            _mockServicioComandos.Setup(s => s.Ejecutar(It.IsAny<AfipSolicitarCierreCargaGranel>())).Returns(resultado);

            // Act
            var result = _servicioAfip.SolicitarCierreCargaGranel(dto, "test");

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public void EfectuarSolicitudCierreCarga_ShouldUpdateState_WhenPending()
        {
            // Arrange
            var afipCoemEstado = new AfipCoemEstado
            {
                Id = 9,
                Codigo = "CODE",
                Estado = "CODE",
                Orden = 4
            };
            _mockRepositorio.Setup(r => r.Obtener<AfipSolicitudCierreCarga>(It.IsAny<int>())).Returns(FakeAfipSolicitudCierreCarga.FakeFullItem);
            _mockRepositorio.Setup(r => r.Obtener<AfipCoemEstado>(It.IsAny<int>())).Returns(afipCoemEstado);

            _servicioAfip = new ServicioAfip(
                _mockRepositorio.Object,
                _mockConversor.Object,
                _logger,
                _mockServicioComandos.Object,
                _mockServicioRepositorio.Object
            );

            // Act
            _servicioAfip.EfectuarSolicitudCierreCarga(1, "test");

            // Assert
            Assert.AreEqual((int)EstadosSolicitudesAFIP.Pendiente, FakeAfipSolicitudCierreCarga.FakeFullItem().Estado);
            _mockRepositorio.Verify(r => r.GuardarCambios(), Times.Once());
        }

        [Test]
        public void RechazarSolicitudCierreCarga_ShouldUpdateState_WhenPending()
        {
            // Arrange
            var solicitudDb = new AfipSolicitudCierreCarga { Estado = (int)EstadosSolicitudesAFIP.Pendiente };
            _mockRepositorio.Setup(r => r.Obtener<AfipSolicitudCierreCarga>(It.IsAny<int>())).Returns(solicitudDb);

            // Act
            _servicioAfip.RechazarSolicitudCierreCarga(1, "test");

            // Assert
            Assert.AreEqual((int)EstadosSolicitudesAFIP.Rechazado, solicitudDb.Estado);
            _mockRepositorio.Verify(r => r.GuardarCambios(), Times.Once());
        }
    }
}
