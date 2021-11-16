using System;
using System.Drawing;
using System.Runtime.Serialization;

namespace Molinos.Scato.Dominio.Comandos
{
    public class LeerNumeroCartaPorte : Comando
    {
        public string NombreArchivo { get; set; }
        public byte[] CodigoBarrasCartaPorte { get; set; }
    }
}
