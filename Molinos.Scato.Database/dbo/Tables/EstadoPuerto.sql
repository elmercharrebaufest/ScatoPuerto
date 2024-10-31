CREATE TABLE [dbo].[EstadoPuerto] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
	[FechaCalado]       DATETIME NULL,
	[FechaUbicacion]       DATETIME NULL,
	[FechaAlturaRio]       DATETIME NULL,
	[Calado]       nvarchar(1000) NULL,
	[Ubicacion]       nvarchar(1000) NULL,
	[AlturaDelRio]       nvarchar(1000) NULL,
    CONSTRAINT [PK_dbo.EstadoPuerto] PRIMARY KEY CLUSTERED ([Id] ASC)
    );