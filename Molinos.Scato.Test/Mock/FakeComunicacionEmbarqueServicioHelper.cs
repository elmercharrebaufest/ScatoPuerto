using Molinos.Scato.Servicios.AFIP;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Test.Mock
{
	internal static class FakeComunicacionEmbarqueServicioHelper
	{
		internal static ResponseTicketAccesoAfip GenerateResponseTicketAccesoAfip()
		{
			var data = new Data();
			data.Service = "Service";
			data.Sign = "Sign";
			data.Token = "Token";
			data.CuitRepresentado = "CuitRepresentado";
			data.ExpirationTime = DateTime.Now;
			data.GenerationTime = DateTime.Now;
			var response = new ResponseTicketAccesoAfip();
			response.Data = data;
			response.IsValid = true;
			response.Messages = new List<string>();
			return response;
		}
	}
}
