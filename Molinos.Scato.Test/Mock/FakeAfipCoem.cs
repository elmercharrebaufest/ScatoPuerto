using Molinos.Scato.Dominio.Entidades;
using System.Collections.Generic;
using System;

namespace Molinos.Scato.Test.Mock
{
	internal static class FakeAfipCoem
	{
		internal static AfipCoem FakeItem()
		{
			var fake = new AfipCoem();
			fake.Id = 1;
			fake.AfipCaratula = new AfipCaratula();
			fake.IdentificadorCOEM = "IdentificadorCOEM";
			fake.IdentificadorCaratula = "IdentificadorCaratula";
			fake.ContenedoresConCarga = new List<AfipCoemContenedorConCarga>();
			fake.ContenedoresVacios = new List<AfipCoemContenedorVacio>();
			fake.MercaderiasSueltas = new List<AfipCoemMercaderiaSuelta>();
			fake.AfipSolicitudesNoABordo = new List<AfipSolicitudNoABordo>();
			fake.AfipCoemEstado = new AfipCoemEstado();
			fake.FechaRegistro = DateTime.Now;
			return fake;
		}

		internal static List<AfipCoem> FakeList(int toGenerate)
		{
			var fake = new List<AfipCoem>();
			for (var i = 1; i <= toGenerate; i++)
			{
				var item = new AfipCoem();
				item.Id = i;
				item.AfipCaratula = new AfipCaratula();
				item.IdentificadorCOEM = "IdentificadorCOEM" + i;
				item.IdentificadorCaratula = "IdentificadorCaratula" + i;
				item.ContenedoresConCarga = new List<AfipCoemContenedorConCarga>();
				item.ContenedoresVacios = new List<AfipCoemContenedorVacio>();
				item.MercaderiasSueltas = new List<AfipCoemMercaderiaSuelta>();
				item.AfipSolicitudesNoABordo = new List<AfipSolicitudNoABordo>();
				item.AfipCoemEstado = new AfipCoemEstado();
				item.FechaRegistro = DateTime.Now;
				fake.Add(item);
			}
			return fake;
		}
	}
}
