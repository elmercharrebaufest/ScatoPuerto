using Molinos.Scato.Dominio.Entidades;
using System.Collections.Generic;
using System;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;

namespace Molinos.Scato.Test.Mock
{
	internal static class FakeAfipCoemDto
	{
		internal static AfipCoemDto FakeItem()
		{
			var fake = new AfipCoemDto();
			fake.Id = 1;
			fake.IdentificadorCOEM = "IdentificadorCOEM";
			fake.IdentificadorCaratula = "IdentificadorCaratula";
			fake.ContenedoresConCarga = new List<AfipCoemContenedorConCargaDto>();
			fake.ContenedoresVacios = new List<AfipCoemContenedorVacioDto>();
			fake.MercaderiasSueltas = new List<AfipCoemMercaderiaSueltaDto>();
			fake.AfipSolicitudesNoABordo = new List<AfipSolicitudNoABordoDto>();
			fake.AfipCoemEstado = new AfipCoemEstadoDto();
			fake.FechaRegistro = DateTime.Now;
			return fake;
		}

		internal static List<AfipCoemDto> FakeList(int toGenerate)
		{
			var fake = new List<AfipCoemDto>();
			for (var i = 1; i <= toGenerate; i++)
			{
				var item = new AfipCoemDto();
				item.Id = i;
				item.IdentificadorCOEM = "IdentificadorCOEM" + i;
				item.IdentificadorCaratula = "IdentificadorCaratula" + i;
				item.ContenedoresConCarga = new List<AfipCoemContenedorConCargaDto>();
				item.ContenedoresVacios = new List<AfipCoemContenedorVacioDto>();
				item.MercaderiasSueltas = new List<AfipCoemMercaderiaSueltaDto>();
				item.AfipSolicitudesNoABordo = new List<AfipSolicitudNoABordoDto>();
				item.AfipCoemEstado = new AfipCoemEstadoDto();
				item.FechaRegistro = DateTime.Now;
				fake.Add(item);
			}
			return fake;
		}
	}
}
