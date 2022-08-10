using Molinos.Scato.Dominio.Entidades;
using System;


namespace Molinos.Scato.Dominio.Dto
{
    public class ArchivosPuertoDto
    {
        public int Id { get; set; }
        public int Usuario_Id { get; set; }
        public string NombreArchivo { get; set; }
        public string Archivo { get; set; }
        public DateTime Fecha { get; set; }
        public int Embarque_id { get; set; }
        public TipoArchivoPuertoDto TipoArchivoPuerto { get; set; }
    }
}