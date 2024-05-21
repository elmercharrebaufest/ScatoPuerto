using Molinos.Scato.Dominio.Entidades;
using System.Collections.Generic;
using System;
using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Test.Mock
{
	internal static class FakeAfipCaratulaDto
	{
		internal static AfipCaratulaDto FakeItemDtoSolido()
		{
			var fake = new AfipCaratulaDto();
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
			fake.Itinerario = new List<AfipCaratulaItinerarioDto>();
			fake.FechaRegistro = DateTime.Now;
			fake.Estado = "Estado";
			fake.SolicitudesCambioBuque = new List<AfipSolicitudCambioBuqueDto>();
			fake.SolicitudesCambioFechas = new List<AfipSolicitudCambioFechasDto>();
			fake.IdentificadorCierre = "IdentificadorCierre";
			fake.SolicitudesCierreCarga = new List<AfipSolicitudCierreCargaDto>();
			fake.EsLiquido = false;
			return fake;
		}

		internal static List<AfipCaratulaDto> FakeListDtoSolido(int toGenerate)
		{
			var fake = new List<AfipCaratulaDto>();
			for (var i = 1; i <= toGenerate; i++)
			{
				var item = new AfipCaratulaDto();
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
				item.Itinerario = new List<AfipCaratulaItinerarioDto>();
				item.FechaRegistro = DateTime.Now;
				item.Estado = "Estado" + i;
				item.SolicitudesCambioBuque = new List<AfipSolicitudCambioBuqueDto>();
				item.SolicitudesCambioFechas = new List<AfipSolicitudCambioFechasDto>();
				item.IdentificadorCierre = "IdentificadorCierre";
				item.SolicitudesCierreCarga = new List<AfipSolicitudCierreCargaDto>();
				item.EsLiquido = false;
				fake.Add(item);
			}
			return fake;
		}
	}
}
