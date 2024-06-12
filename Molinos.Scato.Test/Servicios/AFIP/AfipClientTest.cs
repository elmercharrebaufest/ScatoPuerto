using log4net.Config;
using log4net;
using Molinos.Scato.Servicios.AFIP;
using Moq;
using Newtonsoft.Json;
using Ninject;
using Ninject.Extensions.Logging;
using Ninject.Extensions.Logging.Log4net;
using Ninject.Modules;
using NUnit.Framework;
using RestSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using FluentAssertions;

namespace Molinos.Scato.Test.Servicios.AFIP
{
	[TestFixture]
	public class AfipClientTest
	{
		private Mock<IRestClientWrapper> _mockRestClient;
		private AfipClient _afipClient;
		private ILogger _logger;

		[SetUp]
		public void Setup()
		{
			_mockRestClient = new Mock<IRestClientWrapper>();
			_logger = ConfigureLog();
			_afipClient = new AfipClient(_mockRestClient.Object, _logger);
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
		public void GetTicketAccesoAfip_ShouldReturnValidResponse()
		{
			// Arrange
			var expectedResponse = new ResponseTicketAccesoAfip
			{
				Data = new Data
				{
					Service = "wgescomunicacionembarque",
					Sign = "V9CEWaAS4guJGZogh+7eSgqWGE4UvKhYg5dbAx56ep90flmg0lrEHpM88QQqiDb5H+14bcriT9/kS20IjmAV2SBOM3z4a3IZ1WZCNwQhrvtCBq56AIsRQmXw4YM+amIbEHLr7ITQV9iEJjNnkYSa4vJizby2E3a9K4gxy2wWMls=",
					Token = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8c3NvIHZlcnNpb249IjIuMCI+CiAgICA8aWQgc3JjPSJDTj13c2FhaG9tbywgTz1BRklQLCBDPUFSLCBTRVJJQUxOVU1CRVI9Q1VJVCAzMzY5MzQ1MDIzOSIgdW5pcXVlX2lkPSI4MDk5MzE4NDUiIGdlbl90aW1lPSIxNzE4MTM2NDM3IiBleHBfdGltZT0iMTcxODE3OTY5NyIvPgogICAgPG9wZXJhdGlvbiB0eXBlPSJsb2dpbiIgdmFsdWU9ImdyYW50ZWQiPgogICAgICAgIDxsb2dpbiBlbnRpdHk9IjMzNjkzNDUwMjM5IiBzZXJ2aWNlPSJ3Z2VzY29tdW5pY2FjaW9uZW1iYXJxdWUiIHVpZD0iU0VSSUFMTlVNQkVSPUNVSVQgMjAzMTQ2Mjk2NDgsIENOPXNjYXRvcHVlcnRvIiBhdXRobWV0aG9kPSJjbXMiIHJlZ21ldGhvZD0iMjIiPgogICAgICAgICAgICA8cmVsYXRpb25zPgogICAgICAgICAgICAgICAgPHJlbGF0aW9uIGtleT0iMjAwNDA0MTAwMjQiIHJlbHR5cGU9IjQiLz4KICAgICAgICAgICAgICAgIDxyZWxhdGlvbiBrZXk9IjMwNzE1MTE4NzczIiByZWx0eXBlPSI0Ii8+CiAgICAgICAgICAgIDwvcmVsYXRpb25zPgogICAgICAgIDwvbG9naW4+CiAgICA8L29wZXJhdGlvbj4KPC9zc28+Cg==",
					CuitRepresentado = "30715118773",
					ExpirationTime = DateTime.Parse("2024-06-12T05:08:17.75"),
					GenerationTime = DateTime.Parse("2024-06-11T17:08:17.75")
				},
				IsValid = true,
				Messages = new List<string>()
			};

			var responseContent = JsonConvert.SerializeObject(expectedResponse);
			var restResponse = new Mock<IRestResponse>();
			restResponse.Setup(r => r.Content).Returns(responseContent);
			_mockRestClient.Setup(c => c.Execute(It.IsAny<IRestRequest>())).Returns(restResponse.Object);

			// Act
			var result = _afipClient.GetTicketAccesoAfip();

			// Assert
			result.Should().NotBeNull();
			result.Data.Service.Should().NotBeNull();
			result.Data.Service.Should().Equals(expectedResponse.Data.Service);
			result.Data.Sign.Should().NotBeNull();
			result.Data.Sign.Should().Equals(expectedResponse.Data.Sign);
			result.Data.Token.Should().NotBeNull();
			result.Data.Token.Should().Equals(expectedResponse.Data.Token);
			result.Data.CuitRepresentado.Should().NotBeNull();
			result.Data.CuitRepresentado.Should().Equals(expectedResponse.Data.CuitRepresentado);
			result.Data.ExpirationTime.Should().Equals(expectedResponse.Data.ExpirationTime);
			result.Data.GenerationTime.Should().Equals(expectedResponse.Data.GenerationTime);
			result.IsValid.Should().Equals(expectedResponse.IsValid);
		}
	}
}
