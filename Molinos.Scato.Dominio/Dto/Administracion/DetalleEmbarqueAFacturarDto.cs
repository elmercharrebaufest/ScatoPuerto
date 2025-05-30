using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class DetalleEmbarqueAFacturarDto
    {
        public int IdEmbarque {  get; set; }
        public int VaporInfoId { get; set; }
        public bool EsLiq { get; set; }
        public string Estado { get; set; }
        public string Buque {  get; set; }
        public string Muelle { get; set; }
        public DateTime? Amarre { get; set; }
        public string HoraAmarre { get; set; }
        public DateTime? Desamarre { get; set; }
        public string HoraDesamarre { get; set; }
        public int NroOp { get; set; }
        public bool Senasa { get; set; }
        public bool DefMoviles { get; set; }
        public bool FumigacionPrev { get; set; }
        public bool FumigacionCur { get; set; }
        public bool UsoPala { get; set; }
        public string Surveyor { get; set; }
        public DateTime? ObligacionCarga { get; set; }
        public bool EstibadoTrimado { get; set; }
        public string Ata { get; set; }
        public ICollection<ExportadorDto> Exportadores { get; set; }
        public ICollection<AgenciaMaritimaPuertoDto> Agencias { get; set; }
        public ICollection<CoordinadorPuertoDto> Clientes { get; set; }
        public ICollection<DestinoDto> Destinos { get; set; }
        public ICollection<InformacionBuqueDto> Cargas { get; set; }
        public AdministracionEmbarqueDto AdministracionEmbarque { get; set; }
        public decimal Trn { get; set; }
        public DateTime? FechaLineUp { get; set; }
        public DateTime? FechaFacturado { get; set; }
        public DateTime? FechaOperaciones { get; set; }
        public DateTime? FechaCalidad { get; set; }
        public DateTime? FechaZarpado { get; set; }

    }

    public class InformacionBuqueDto
    {
        public string Exportador { get; set; }
        public string MaterialPuerto { get; set; }
        public decimal Tn { get; set; }
        public string TanqueOrigen { get; set; }
        public string NroTanque { get; set; }
        public string SiloCelda { get; set; }
        public int Bodega { get; set; }
    }
}