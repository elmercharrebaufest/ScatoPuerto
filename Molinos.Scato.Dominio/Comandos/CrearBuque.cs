using System;
using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos
{
    public class CrearBuque : Comando
    {
        public VaporInformacionDto VaporInformacion { get; set; }
        public ArchivoDto Archivo { get; set; }
        public ResultadoEnvioBuqueSap ResultadoSap { get; set; }
    }

    public class ResultadoEnvioBuqueSap
    {
        public bool Enviado { get; set; }
        public string Mensaje { get; set; }
    }
}
