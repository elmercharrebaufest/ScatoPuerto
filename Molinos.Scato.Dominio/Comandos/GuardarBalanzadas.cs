using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarBalanzadas : Comando
    {
        public ModuloBalanzas moduloBalanzas { get; set; }
    }

    public class ModuloBalanzas
    {
        public int id { get; set; }
        public int moduloDeCarga_Id { get; set; }
        public string Observaciones { get; set; }
        public int MotivoFalla_ID { get; set; }
        public List<Balanzadas> Balanzadas { get; set; }
    }

    public class Balanzadas
    {
        public int id { get; set; }
        public string NumeroBalanza { get; set; }
    }
}
