using System;
using System.Collections.Generic;

namespace Molinos.Scato.Servicios.AFIP
{
    public class ResponseTicketAccesoAfip
    {
        public Data Data { get; set; }
        public bool IsValid { get; set; }
        public List<string> Messages { get; set; }
    }

    public class Data
    {
        public string Service { get; set; }
        public string Sign { get; set; }
        public string Token { get; set; }
        public string CuitRepresentado { get; set; }
        public DateTime ExpirationTime { get; set; }
        public DateTime GenerationTime { get; set; }
    }
}