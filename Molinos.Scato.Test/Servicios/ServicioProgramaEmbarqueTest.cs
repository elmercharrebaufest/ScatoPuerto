using FluentAssertions;
using Molinos.Scato.Dominio.Comandos.SAP;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Entidades.SAP;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Impl;
using Molinos.Scato.Servicios.Procesamiento.SAP;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Test.Mock;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Molinos.Scato.Test.Servicios
{
	[TestFixture]
	public class ServicioProgramaEmbarqueTest
	{
		private Mock<IRepositorio> _mockRepositorio;
		private Mock<IConversor> _mockConversor;
		private Mock<IServicioComandos> _mockComandos;
		private Mock<ZSDWS_SCATO> _mockServicioSap;

		private ServicioProgramaEmbarque _servicio;
		private ProcesadorEnviarEmbarqueSAP _procesador;

		[SetUp]
		public void Setup()
		{
			_mockRepositorio = new Mock<IRepositorio>();
			_mockConversor = new Mock<IConversor>();
			_mockComandos = new Mock<IServicioComandos>();
			_mockServicioSap = new Mock<ZSDWS_SCATO>();

			// Servicio original (Ahora solo encola)
			_servicio = new ServicioProgramaEmbarque(
				_mockRepositorio.Object,
				_mockConversor.Object,
				new NullLogger(),
				_mockComandos.Object,
				_mockServicioSap.Object
			);

			// Nuevo procesador asincrónico (Contiene la lógica dura de SAP)
			_procesador = new ProcesadorEnviarEmbarqueSAP(
				_mockRepositorio.Object,
				_mockConversor.Object,
				new NullLogger(),
				_mockServicioSap.Object
			);
		}

		#region ValidarEnviarEmbarqueSAP

		[Test]
		public void ValidarEnviarEmbarqueSAP_EmbarqueNulo_RetornaInmediatamente()
		{
			_mockRepositorio
				.Setup(r => r.Obtener<Embarque>(It.IsAny<Expression<Func<Embarque, bool>>>()))
				.Returns((Embarque)null);

			Assert.That(() => _servicio.ValidarEnviarEmbarqueSAP(1, "usuario"), Throws.Nothing);
		}

		[Test]
		public void ValidarEnviarEmbarqueSAP_SanBenitoFalso_NoEncola()
		{
			_mockRepositorio
				.Setup(r => r.Obtener<Embarque>(It.IsAny<Expression<Func<Embarque, bool>>>()))
				.Returns(new Embarque { Id = 1, SanBenito = false, Ubicacion = 1 });

			Assert.That(() => _servicio.ValidarEnviarEmbarqueSAP(1, "usuario"), Throws.Nothing);
		}

		[Test]
		public void ValidarEnviarEmbarqueSAP_UbicacionInvalida_NoEncola()
		{
			_mockRepositorio
				.Setup(r => r.Obtener<Embarque>(It.IsAny<Expression<Func<Embarque, bool>>>()))
				.Returns(new Embarque { Id = 1, SanBenito = true, Ubicacion = 2 });

			Assert.That(() => _servicio.ValidarEnviarEmbarqueSAP(1, "usuario"), Throws.Nothing);
		}

		[Test]
		public void ValidarEnviarEmbarqueSAP_SinLineUp_NoEncola()
		{
			_mockRepositorio
				.Setup(r => r.Obtener<Embarque>(It.IsAny<Expression<Func<Embarque, bool>>>()))
				.Returns(new Embarque { Id = 1, SanBenito = true, Ubicacion = 1 });

			_mockRepositorio
				.Setup(r => r.Obtener<LineUp>(It.IsAny<Expression<Func<LineUp, bool>>>()))
				.Returns((LineUp)null);

			Assert.That(() => _servicio.ValidarEnviarEmbarqueSAP(1, "usuario"), Throws.Nothing);
		}

		[Test]
		public void ValidarEnviarEmbarqueSAP_LineUpSinModuloDeCarga_NoEncola()
		{
			_mockRepositorio
				.Setup(r => r.Obtener<Embarque>(It.IsAny<Expression<Func<Embarque, bool>>>()))
				.Returns(new Embarque { Id = 1, SanBenito = true, Ubicacion = 1 });

			_mockRepositorio
				.Setup(r => r.Obtener<LineUp>(It.IsAny<Expression<Func<LineUp, bool>>>()))
				.Returns(new LineUp { Id = 1, ModuloDeCarga = null });

			Assert.That(() => _servicio.ValidarEnviarEmbarqueSAP(1, "usuario"), Throws.Nothing);
		}

		[Test]
		public void ValidarEnviarEmbarqueSAP_SinCargasFisicas_NoEncola()
		{
			_mockRepositorio
				.Setup(r => r.Obtener<Embarque>(It.IsAny<Expression<Func<Embarque, bool>>>()))
				.Returns(new Embarque { Id = 1, SanBenito = true, Ubicacion = 1 });

			_mockRepositorio
				.Setup(r => r.Obtener<LineUp>(It.IsAny<Expression<Func<LineUp, bool>>>()))
				.Returns(new LineUp { Id = 1, ModuloDeCarga = new ModuloDeCarga { Id = 5 } });

			_mockRepositorio
				.Setup(r => r.ListarConsultable<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(
					It.IsAny<Expression<Func<ModuloDeCargaPlanillaDeTurnosDetallesSolido, bool>>>()))
				.Returns(Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesSolido>().AsQueryable());

			_mockRepositorio
				.Setup(r => r.ListarConsultable<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>(
					It.IsAny<Expression<Func<ModuloDeCargaPlanillaDeTurnosDetallesLiquido, bool>>>()))
				.Returns(Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>().AsQueryable());

			Assert.That(() => _servicio.ValidarEnviarEmbarqueSAP(1, "usuario"), Throws.Nothing);
		}

		[Test]
		public void ValidarEnviarEmbarqueSAP_CondicionesCumplidas_EncolaCorrectamente()
		{
			SetupMocksForEnviarEmbarqueASAP(
				embarqueId: 1,
				previousTransactions: new List<TransaccionesSAP>(),
				sapResponse: "OK");

			// Se verifica que finaliza limpiamente. El enqueue ocurre estáticamente en ColaComandosAsincronico
			Assert.That(() => _servicio.ValidarEnviarEmbarqueSAP(1, "usuario"), Throws.Nothing);
		}

		#endregion

		#region ProcesadorEnviarEmbarqueSAP (Ex EnviarEmbarqueASAP)

		[Test]
		public void Ejecutar_PrimerEnvio_CreaTransaccionConOperacionAlta()
		{
			TransaccionesSAP captured = null;
			SetupMocksForEnviarEmbarqueASAP(
				embarqueId: 1,
				previousTransactions: new List<TransaccionesSAP>(),
				sapResponse: "OK",
				onAgregar: t => captured = t);

			_procesador.Ejecutar(new EnviarEmbarqueSAP { EmbarqueId = 1, Usuario = "usuario" });

			captured.Should().NotBeNull();
			captured.Operacion.Should().Be("A");
		}

		[Test]
		public void Ejecutar_EnvioPrevioExitoso_CreaTransaccionConOperacionModificacion()
		{
			var prev = new TransaccionesSAP
			{
				Id = 10,
				Estado = "Enviado",
				Entidad = "Embarque",
				Entidad_Id = 1,
				DetallesEmbarque = new List<TransaccionesSAPDetallesEmbarque>()
			};
			TransaccionesSAP captured = null;
			SetupMocksForEnviarEmbarqueASAP(
				embarqueId: 1,
				previousTransactions: new List<TransaccionesSAP> { prev },
				sapResponse: "OK",
				onAgregar: t => captured = t);

			_mockRepositorio
				.Setup(r => r.Listar<TransaccionesSAPDetallesEmbarque>(
					It.IsAny<Expression<Func<TransaccionesSAPDetallesEmbarque, bool>>>()))
				.Returns(new List<TransaccionesSAPDetallesEmbarque>());

			_procesador.Ejecutar(new EnviarEmbarqueSAP { EmbarqueId = 1, Usuario = "usuario" });

			captured.Should().NotBeNull();
			captured.Operacion.Should().Be("M");
		}

		[Test]
		public void Ejecutar_IntentoPrevioConError_IncrementaReintento()
		{
			var prev = new TransaccionesSAP
			{
				Id = 10,
				Estado = "Error",
				Reintento = 2,
				Entidad = "Embarque",
				Entidad_Id = 1
			};
			TransaccionesSAP captured = null;
			SetupMocksForEnviarEmbarqueASAP(
				embarqueId: 1,
				previousTransactions: new List<TransaccionesSAP> { prev },
				sapResponse: "OK",
				onAgregar: t => captured = t);

			_procesador.Ejecutar(new EnviarEmbarqueSAP { EmbarqueId = 1, Usuario = "usuario" });

			captured.Should().NotBeNull();
			captured.Reintento.Should().Be(3);
		}

		[Test]
		public void Ejecutar_RespuestaSAPOk_EstadoEnviado()
		{
			TransaccionesSAP captured = null;
			SetupMocksForEnviarEmbarqueASAP(
				embarqueId: 1,
				previousTransactions: new List<TransaccionesSAP>(),
				sapResponse: "OK",
				onAgregar: t => captured = t);

			_procesador.Ejecutar(new EnviarEmbarqueSAP { EmbarqueId = 1, Usuario = "usuario" });

			captured.Should().NotBeNull();
			captured.Estado.Should().Be("Enviado");
		}

		[Test]
		public void Ejecutar_RespuestaSAPError_EstadoErrorYLanzaExcepcion()
		{
			TransaccionesSAP captured = null;
			SetupMocksForEnviarEmbarqueASAP(
				embarqueId: 1,
				previousTransactions: new List<TransaccionesSAP>(),
				sapResponse: "ERROR",
				onAgregar: t => captured = t);

			// En la arquitectura CQRS, un error en el procesador debe arrojar excepción
			Action act = () => _procesador.Ejecutar(new EnviarEmbarqueSAP { EmbarqueId = 1, Usuario = "usuario" });

			act.Should().Throw<Exception>().WithMessage("Error de SAP:*");
			captured.Should().NotBeNull();
			captured.Estado.Should().Be("Error");
		}

		[Test]
		public void Ejecutar_RespuestaSAPNumeroOperacionYaExistente_EstadoEnviado()
		{
			TransaccionesSAP captured = null;
			SetupMocksForEnviarEmbarqueASAP(
				embarqueId: 1,
				previousTransactions: new List<TransaccionesSAP>(),
				sapResponse: "ERROR",
				sapMessage: "Número de operación ya existente",
				onAgregar: t => captured = t);

			_procesador.Ejecutar(new EnviarEmbarqueSAP { EmbarqueId = 1, Usuario = "usuario" });

			captured.Should().NotBeNull();
			captured.Estado.Should().Be("Enviado");
		}

		[Test]
		public void Ejecutar_ExcepcionEnServicioSAP_LanzaExcepcionConPrefijo()
		{
			SetupMocksForEnviarEmbarqueASAP(
				embarqueId: 1,
				previousTransactions: new List<TransaccionesSAP>(),
				sapResponse: null,
				sapThrows: true);

			Action act = () => _procesador.Ejecutar(new EnviarEmbarqueSAP { EmbarqueId = 1, Usuario = "usuario" });

			act.Should().Throw<Exception>().WithMessage("*SAP connection error*");
		}

		#endregion

		#region Helper

		private void SetupMocksForEnviarEmbarqueASAP(
			int embarqueId,
			List<TransaccionesSAP> previousTransactions,
			string sapResponse,
			string sapMessage = "",
			bool sapThrows = false,
			Action<TransaccionesSAP> onAgregar = null)
		{
			const int moduloCargaId = 5;

			var vapor = new Vapor { Id = 1 };
			var embarque = new Embarque { Id = embarqueId, SanBenito = true, Ubicacion = 1, Vapor = vapor };
			var vaporInfo = new VaporInformacion { Id = 1, ImoVapor = "IMO001", Vapor = vapor };
			var moduloDeCarga = new ModuloDeCarga { Id = moduloCargaId };
			var lineUp = new LineUp { Id = 1, Embarque = embarque, ModuloDeCarga = moduloDeCarga };

			var exportador = new Exportador { Id = 1, CodigoSap = "EXP001" };
			var material = new MaterialPuerto { Id = 1, CodigoSAP = "MAT001" };
			var planilla = new ModuloDeCargaPlanillaDeTurnos { Id = 1, ModuloDeCarga = moduloDeCarga };
			var solido = new ModuloDeCargaPlanillaDeTurnosDetallesSolido
			{
				Id = 1,
				ModuloDeCargaPlanillaDeTurnos = planilla,
				Exportador = exportador,
				MaterialPuerto = material,
				Destino = null,
				Cantidad = 1000
			};

			var tipoContratoFas = new TipoDeContrato { Id = 1, Descripcion = "FAS" };
			var nominacionExportador = new NominacionDatoTecnicoExportador { Id = 1, Exportador = exportador };
			var datoTecnico = new NominacionDatoTecnico
			{
				Id = 1,
				MaterialPuerto = material,
				TipoDeContrato = tipoContratoFas,
				NominacionDatoTecnicoExportador = new List<NominacionDatoTecnicoExportador> { nominacionExportador }
			};
			var nominacion = new Nominacion { Id = 1, NominacionDatoTecnico = datoTecnico };

			_mockRepositorio
				.Setup(r => r.Obtener<Embarque>(It.IsAny<Expression<Func<Embarque, bool>>>()))
				.Returns(embarque);

			_mockRepositorio
				.Setup(r => r.Listar<TransaccionesSAP>(It.IsAny<Expression<Func<TransaccionesSAP, bool>>>()))
				.Returns(previousTransactions);

			_mockRepositorio
				.Setup(r => r.Agregar(It.IsAny<TransaccionesSAP>()))
				.Callback<TransaccionesSAP>(t => onAgregar?.Invoke(t))
				.Returns<TransaccionesSAP>(t => t);

			_mockRepositorio
				.Setup(r => r.Obtener<VaporInformacion>(It.IsAny<Expression<Func<VaporInformacion, bool>>>()))
				.Returns(vaporInfo);

			_mockRepositorio
				.Setup(r => r.ListarConsultable<EmbarqueCoordinador>(
					It.IsAny<Expression<Func<EmbarqueCoordinador, bool>>>()))
				.Returns(Enumerable.Empty<EmbarqueCoordinador>().AsQueryable());

			_mockRepositorio
				.Setup(r => r.Obtener<LineUp>(It.IsAny<Expression<Func<LineUp, bool>>>()))
				.Returns(lineUp);

			_mockRepositorio
				.Setup(r => r.ListarConsultable<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(
					It.IsAny<Expression<Func<ModuloDeCargaPlanillaDeTurnosDetallesSolido, bool>>>()))
				.Returns(new List<ModuloDeCargaPlanillaDeTurnosDetallesSolido> { solido }.AsQueryable());

			_mockRepositorio
				.Setup(r => r.ListarConsultable<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>(
					It.IsAny<Expression<Func<ModuloDeCargaPlanillaDeTurnosDetallesLiquido, bool>>>()))
				.Returns(Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>().AsQueryable());

			_mockRepositorio
				.Setup(r => r.Listar<Nominacion>(It.IsAny<Expression<Func<Nominacion, bool>>>()))
				.Returns(new List<Nominacion> { nominacion });

			_mockRepositorio
				.Setup(r => r.Obtener<TipoDeContrato>(It.IsAny<Expression<Func<TipoDeContrato, bool>>>()))
				.Returns(tipoContratoFas);

			_mockRepositorio
				.Setup(r => r.ListarConsultable<TransaccionesSAPDetallesEmbarque>(
					It.IsAny<Expression<Func<TransaccionesSAPDetallesEmbarque, bool>>>()))
				.Returns(Enumerable.Empty<TransaccionesSAPDetallesEmbarque>().AsQueryable());

			if (sapThrows)
			{
				_mockServicioSap
					.Setup(s => s.Z_SDMF_RFC_ABM_OP_DETALLES(It.IsAny<Z_SDMF_RFC_ABM_OP_DETALLESRequest>()))
					.Throws(new Exception("SAP connection error"));
			}
			else
			{
				var sapRespuesta = new Z_SDMF_RFC_ABM_OP_DETALLESResponse
				{
					EX_RESPONSE = sapResponse,
					EX_MESSAGE = sapMessage
				};
				var sapResult = new Z_SDMF_RFC_ABM_OP_DETALLESResponse1(sapRespuesta);
				_mockServicioSap
					.Setup(s => s.Z_SDMF_RFC_ABM_OP_DETALLES(It.IsAny<Z_SDMF_RFC_ABM_OP_DETALLESRequest>()))
					.Returns(sapResult);
			}
		}

		#endregion
	}
}