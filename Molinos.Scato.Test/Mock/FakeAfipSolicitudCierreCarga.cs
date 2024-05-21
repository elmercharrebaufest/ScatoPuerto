using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
using System.Collections.Generic;
using System;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios.Enumeradores;

namespace Molinos.Scato.Test.Mock
{
	internal static class FakeAfipSolicitudCierreCarga
	{
		internal static AfipSolicitudCierreCarga FakeFullItem()
		{
			var fake = new AfipSolicitudCierreCarga();
			fake.Id = 1;
			fake.AfipCaratula = FakeAfipCaratula.FakeFullItemSolido();
			fake.IdentificadorCierre = "IdentificadorCierre";
			fake.FechaCreacion = DateTime.Now;
			fake.FechaActualizacion = DateTime.Now;
			fake.Estado = (int) EstadosSolicitudesAFIP.Pendiente;
			return fake;
		}
	}
}
