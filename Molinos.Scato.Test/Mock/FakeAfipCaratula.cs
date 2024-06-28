using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Test.Mock
{
	internal static class FakeAfipCaratula
	{
		internal static AfipCaratula FakeFullItemSolido()
		{
			var fake = new AfipCaratula();
			fake.Id = 1;
			fake.IdentificadorCaratula = "Caratula";
			fake.IdentificadorBuque = "Buque";
			fake.CodigoAduana = "001";
			fake.CodigoLugarOperativo = "002";
			fake.FechaArribo = DateTime.Now;
			fake.FechaZarpada = DateTime.Now;
			fake.Via = "Via";
			fake.NombreMedioTransporte = "Buque";
			fake.PuertoDestino = "PuertoDestino";
			fake.NumeroViaje = "NumeroViaje";
			fake.Itinerario = new List<AfipCaratulaItinerario>();
			fake.FechaRegistro = DateTime.Now;
			fake.Estado = "Estado";
			fake.Coems = FakeAfipCoem.FakeList(3);
			fake.SolicitudesCambioBuque = new List<AfipSolicitudCambioBuque>();
			fake.SolicitudesCambioFechas = new List<AfipSolicitudCambioFechas>();
			fake.IdentificadorCierre = "IdentificadorCierre";
			fake.SolicitudesCierreCarga = new List<AfipSolicitudCierreCarga>();
			fake.EsLiquido = false;
			return fake;
		}

		internal static AfipCaratula FakeBaseItemSolido()
		{
			var fake = new AfipCaratula();
			fake.Id = 1;
			fake.IdentificadorCaratula = "Caratula";
			fake.IdentificadorBuque = "Buque";
			fake.CodigoAduana = "001";
			fake.CodigoLugarOperativo = "002";
			fake.FechaArribo = DateTime.Now;
			fake.FechaZarpada = DateTime.Now;
			fake.Via = "Via";
			fake.NombreMedioTransporte = "Buque";
			fake.PuertoDestino = "PuertoDestino";
			fake.NumeroViaje = "NumeroViaje";
			fake.Itinerario = new List<AfipCaratulaItinerario>();
			fake.FechaRegistro = DateTime.Now;
			fake.Estado = "Estado";
			fake.Coems = new List<AfipCoem>();
			fake.SolicitudesCambioBuque = new List<AfipSolicitudCambioBuque>();
			fake.SolicitudesCambioFechas = new List<AfipSolicitudCambioFechas>();
			fake.IdentificadorCierre = "IdentificadorCierre";
			fake.SolicitudesCierreCarga = new List<AfipSolicitudCierreCarga>();
			fake.EsLiquido = false;
			return fake;
		}

		internal static List<AfipCaratula> FakeListSolido(int toGenerate)
		{
			var fake = new List<AfipCaratula>();
			for (var i = 1; i <= toGenerate; i++)
			{
				var item = new AfipCaratula();
				item.Id = i;
				item.IdentificadorCaratula = "Caratula" + i;
				item.IdentificadorBuque = "Buque" + i;
				item.CodigoAduana = "001";
				item.CodigoLugarOperativo = "002";
				item.FechaArribo = DateTime.Now;
				item.FechaZarpada = DateTime.Now;
				item.Via = "Via";
				item.NombreMedioTransporte = "Buque" + i;
				item.PuertoDestino = "PuertoDestino" + i;
				item.NumeroViaje = "NumeroViaje" + i;
				item.Itinerario = new List<AfipCaratulaItinerario>();
				item.FechaRegistro = DateTime.Now;
				item.Estado = "Estado" + i;
				item.Coems = new List<AfipCoem>();
				item.SolicitudesCambioBuque = new List<AfipSolicitudCambioBuque>();
				item.SolicitudesCambioFechas = new List<AfipSolicitudCambioFechas>();
				item.IdentificadorCierre = "IdentificadorCierre";
				item.SolicitudesCierreCarga = new List<AfipSolicitudCierreCarga>();
				item.EsLiquido = false;
				fake.Add(item);
			}
			return fake;
		}
	}
}
