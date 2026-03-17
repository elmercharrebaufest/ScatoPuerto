using System;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Repositorio
{ 
    public class ScatoDbContext : DbContext
    {
        public ScatoDbContext():base("ScatoDb")
        {
            Database.SetInitializer<ScatoDbContext>(null);
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // No usamos nombres de tablas en plural. Igualmente la pluralización fucniona solo con nombres en ingles.
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();

            //Se mapean todas las entidades bajo el namespace Molinos.Scato.Dominio.Entidades      
            MapearAssemblyDe<TipoDocumentoIdentidad>(modelBuilder, x => x.Namespace == typeof(TipoDocumentoIdentidad).Namespace, 
                excluir: null);

            // mapeo many-to-many unidireccional con pustos de carga descarga
            modelBuilder.Entity<Recorrido>()
                .HasMany(r => r.PuestosDeCargaDescargas)
                .WithMany(); // sin propiedad d enavecacion para el otro lado

            modelBuilder.Entity<PlanoDeCarga>()
               .HasMany(r => r.AgentesControlPrivado)
               .WithMany();

            modelBuilder.Entity<PlanoDeCargaHistorico>()
               .HasMany(r => r.AgentesControlPrivado)
               .WithMany();

            modelBuilder.Entity<MuestraEnvioACamara>()
                .HasMany(r => r.CaracteristicasDeCalidad)
                .WithMany()
                .Map(m =>
                {
                    m.MapLeftKey("MuestraEnvioACamara_Id");
                    m.MapRightKey("CaracteristicaDeCalidad_Id");
                    m.ToTable("CaracteristicaDeCalidadMuestraEnvioACamara");
                });
            modelBuilder.Entity<CaracteristicasAnalizadas>()
                .HasRequired(l => l.Recorrido) //  Lot will always have 1 Vehicle
                .WithOptional(v => v.CaracteristicasAnalizadas);

            modelBuilder.Entity<LineUp>()
                .Property(p => p.Orden)
                .HasPrecision(18, 4);

            modelBuilder.Entity<ADPuertoGruposRoles>()
                .HasKey(c => new { c.Id_Grupo, c.Id_Rol });
            modelBuilder.Entity<ADPuertoRolesPermisos>()
                .HasKey(c => new { c.Id_Rol, c.Id_Permiso });

            modelBuilder.Entity<ReciboDeBuqueDetalles>()
                .Property(r => r.Cantidad)
                .HasPrecision(20, 4);

            modelBuilder.Entity<NominacionDatoTecnico>()
                .Property(n => n.CantidadTotal)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnico>()
               .Property(n => n.TasaDeCargaValor)
               .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnico>()
               .Property(n => n.CantidadExacta)
               .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnico>()
               .Property(n => n.CantidadConTolerancia)
               .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnico>()
               .Property(n => n.CantidadTotalMaxima)
               .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoDestino>()
                .Property(n => n.Cantidad)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoDestino>()
                .Property(n => n.CantidadConTolerancia)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoDestino>()
                .Property(n => n.CantidadExacta)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoDestino>()
                .Property(n => n.CantidadTotalMaxima)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoExportador>()
                .Property(n => n.Cantidad)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoExportador>()
                .Property(n => n.CantidadConTolerancia)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoExportador>()
                .Property(n => n.CantidadExacta)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoExportador>()
                .Property(n => n.CantidadTotalMaxima)
                .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoCoordinadorPuerto>()
               .Property(n => n.Cantidad)
               .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoCoordinadorPuerto>()
               .Property(n => n.CantidadConTolerancia)
               .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoCoordinadorPuerto>()
               .Property(n => n.CantidadExacta)
               .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionDatoTecnicoCoordinadorPuerto>()
               .Property(n => n.CantidadTotalMaxima)
               .HasPrecision(20, 3);
            modelBuilder.Entity<NominacionRecibo>()
               .Property(n => n.Cantidad)
               .HasPrecision(20, 3);
            modelBuilder.Entity<PlanoDeCargaBodega>()
                .Property(n => n.Cantidad)
                .HasPrecision(18, 3);
            modelBuilder.Entity<PlanoDeCargaBodegaHistorico>()
                .Property(n => n.Cantidad)
                .HasPrecision(18, 3);
            modelBuilder.Entity<CargaComercial>()
                .Property(n => n.Cantidad)
                .HasPrecision(18, 3);
            modelBuilder.Entity<CargaComercialHistorico>()
                .Property(n => n.Cantidad)
                .HasPrecision(18, 3);
            modelBuilder.Entity<PlanoDeCargaBodegaDestino>()
                .Property(n => n.Cantidad)
                .HasPrecision(18, 3);
            modelBuilder.Entity<ModuloDeCargaPlanillaDeEmbarque>()
                .Property(n => n.Tn)
                .HasPrecision(18, 3);
            modelBuilder.Entity<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>()
                .Property(n => n.Cantidad)
                .HasPrecision(18, 3);
            modelBuilder.Entity<AcuerdoDetalle>()
                .Property(n => n.CantidadTotal)
                .HasPrecision(18, 3);
			modelBuilder.Entity<AcuerdoDetalleConceptoPeriodoTarifa>()
				.Property(n => n.ValorTarifa)
				.HasPrecision(15, 3);
		}

        private void MapearAssemblyDe<TEntidad>(DbModelBuilder modelBuilder, Predicate<Type> incluir, Predicate<Type> excluir)
        {
            var tiposEntidades  = typeof (TEntidad).Assembly.GetTypes()
                .Where(x => incluir(x));
            if (excluir != null)
            {
                tiposEntidades = tiposEntidades.Where(x => !excluir(x));
            }

            var metodo = modelBuilder.GetType().GetMethod("Entity");
            foreach (var tipoEntidad in tiposEntidades)
            {
                metodo.MakeGenericMethod(tipoEntidad).Invoke(modelBuilder, null);
            }
        }
    }
}