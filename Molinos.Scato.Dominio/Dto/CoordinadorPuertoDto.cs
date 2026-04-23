namespace Molinos.Scato.Dominio.Dto
{
    public sealed class CoordinadorPuertoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public bool Habilitado { get; set; }
        public string CodigoSap { get; set; }
        public int Pagina { get; set; } = 0;
        public int ItemPorPagina { get; set; } = 0;
        public int ItemsTotales { get; set; } = 0;
        public string Usuario { get; set; } = null;

    }
}
