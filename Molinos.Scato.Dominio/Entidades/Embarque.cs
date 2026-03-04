using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
	public class Embarque : IIdentificable
	{
		[Key]
		public virtual int Id { get; set; }

		public virtual ICollection<MaterialPuertoCantidad> MaterialPuertoCantidad { get; set; }
		public virtual ICollection<EmbarqueCoordinador> Coordinadores { get; set; }
		public virtual AgenciaMaritimaPuerto Agencias { get; set; }
		public virtual Vapor Vapor { get; set; }
		public virtual DateTime? FechaRecalada { get; set; }
		public virtual string HoraRecalada { get; set; }
		public virtual DateTime? ObligacionCarga { get; set; }
		public virtual bool Senasa { get; set; }
		public virtual string Observaciones { get; set; }
		public virtual bool Vicentin { get; set; }
		public virtual bool Noryon { get; set; }
		public virtual bool SanBenito { get; set; }
		public virtual bool OtrosMuelles { get; set; }
		public virtual Recorrido Recorrido { get; set; }
		public virtual Centro Centro { get; set; }
		public virtual string Patente { get; set; }
		public virtual string TipoBuque { get; set; }
		public virtual decimal Freeboard { get; set; }
		public virtual int Ubicacion { get; set; }
		public virtual ATAPuerto ATA { get; set; }
		public virtual bool EsLiquido { get; set; }
		public virtual DateTime? FechaDesdeLimpieza { get; set; }
		public virtual string HoraDesdeLimpieza { get; set; }
		public virtual DateTime? FechaHastaLimpieza { get; set; }
		public virtual string HoraHastaLimpieza { get; set; }
		public virtual MotivosLimpieza MotivosLimpieza { get; set; }
		public virtual string ObservacionesLimpieza { get; set; }
		public virtual Destino Destino { get; set; }
		public virtual decimal PorteNeto { get; set; }
		public virtual decimal PorteBruto { get; set; }
		public virtual decimal Eslora { get; set; }
		public virtual decimal Manga { get; set; }
		public virtual decimal Puntal { get; set; }
		public virtual DateTime? FechaLibrePlatica { get; set; }
		public virtual string HoraLibrePlatica { get; set; }
		public virtual EstadoBuque EstadoBuque { get; set; }
		public virtual string shipParticularArchivoNombre { get; set; }
		public virtual string filePathShipParticular { get; set; }
		public virtual DateTime? FechaHoraInicioCarga { get; set; }
		public virtual string UsuarioInicioCarga { get; set; }

		// public virtual string Imo { get; set; }
		public virtual int CantidadBodegasTanques { get; set; }

		// public Bandera Bandera { get; set; }
		public virtual ICollection<EmbarqueInformacion> EmbarqueInformacion { get; set; }

		public virtual ICollection<EmbarqueInformacionViaje> EmbarqueInformacionViaje { get; set; }
		public virtual ICollection<EmbarquePosicion> EmbarquePosicion { get; set; }
		public virtual AdministracionEmbarque AdministracionEmbarque { get; set; } = null;
		public virtual string FilePathImgLineUp { get; set; }
		public virtual string OtroMuelleNombre { get; set; }
		public virtual int? NroOpSap { get; set; }
		public virtual bool Gmo { get; set; }
		public virtual bool Fito { get; set; }
		public virtual bool MuestraOficial { get; set; }
		public virtual bool CertificadoInocuidad { get; set; }
		public virtual bool CertificadoVeterinario { get; set; }
	}
}