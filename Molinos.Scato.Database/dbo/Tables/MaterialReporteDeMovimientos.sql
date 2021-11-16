CREATE TABLE [dbo].[MaterialReporteDeMovimientos] (
    [Descripcion]      NVARCHAR (40) NOT NULL,
	[Material]      NVARCHAR (40)  NULL,
	[Ingreso]      bit not null default 0,
	[Orden]   int not null
	);
