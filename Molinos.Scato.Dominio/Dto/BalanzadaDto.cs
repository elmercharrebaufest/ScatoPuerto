using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Molinos.Scato.Dominio.Recursos;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class BalanzadaDto
    {
        public int Id { get; set; }
        public string NumeroBalanza { get; set; }
        public int PesoBruto { get; set; }
        public int PesoTara { get; set; }
        public int PesoNeto { get; set; }
        public string Capacidad { get; set; }
        public DateTime? Fecha { get; set; }
        public bool EnviadoASap { get; set; }
        public CargaDto CargaInicial { get; set; }
        public int CargaInicial_Id { get; set; }
        public string CargaInicial_NumeroBalanza { get; set; }

        public  ModuloDeCargaBalanzasDto ModuloDeCargaBalanzas { get; set; }
    }

    public sealed class  BalanzadasAgrupadas
    {
        public string NombreBuque { get; set; }
        public string NumeroBalanza { get; set; }
        public DateTime FechaInicio { get; set; }
        public string HoraInicio { get; set; }
        public decimal Toneladas { get; set; }
        public int Kilos { get; set; }
        public ListadoTotalBalanzadasDto listadoTotalBalanzadas { get; set; }
        public string Producto { get; set; }
        public string Bodega { get; set; }
        public int PorcentajeCarga { get; set; }
        public int TotalProducto { get; set; }
        public bool Seleccionado { get; set; }
        public bool GrupoCompleto { get; set; }
    }

    public sealed class BalanzadasBajaCarga
    {
        public string NombreBuque { get; set; }
        public string NumeroBalanza { get; set; }
        public DateTime FechaInicio { get; set; }
        public string HoraInicio { get; set; }
        public decimal Toneladas { get; set; }
        public int Kilos { get; set; }
        public ListadoTotalBalanzadasDto listadoTotalBalanzadas { get; set; }
        public string Producto { get; set; }
        public string Bodega { get; set; }
    }

    public sealed class CargasPorBodega
    {
        public string NombreBodega { get; set; }
        public string NombreProducto { get; set; }
        public int Cargado { get; set; }
        public int RestaCargar { get; set; }
        public int Excedente { get; set; }
        public int Programado { get; set; }
    }

    public sealed class BalanzadasCompletasDto
    {
        public IList<BalanzadasAgrupadas> balanzadasAgrupadas { get; set; }
        public IList<BalanzadasBajaCarga> balanzadasBajaCarga{ get; set; }
        public IList<BalanzadasBuque> balanzadasBuque { get; set; }
        public IList<CargasPorBodega> cargasPorBodegas { get; set; }
    }

    public sealed class ListadoTotalBalanzadasDto
    {
        public int Id { get; set; }
        public MotivosFallasBalanzaDto MotivosFallasBalanza { get; set; }
        public string Observaciones { get; set; }
        public IList<BalanzadaDto> Balanzadas { get; set; }
    }

    public sealed class BalanzadasBuque
    {
        public int Id { get; set; }
        public string NumeroBalanza { get; set; }
        public int PesoBruto { get; set; }
        public int PesoNeto { get; set; }
        public int PesoTara { get; set; }
        public int CargaInicial_Id { get; set; }
        public int Bodega_Id { get; set; }
        public int Material_Id { get; set; }
    }
}
