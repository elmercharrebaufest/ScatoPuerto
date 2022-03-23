CREATE TABLE [dbo].[PuntoInteresGeolocalizacion] (
    [Id]                  INT IDENTITY (1, 1) NOT NULL,
	[Nombre]              NVARCHAR (80)  NULL,
	[Altitud]             NVARCHAR (80)  NULL,
	[Longitud]            NVARCHAR (80)  NULL,
    [FechaRegistro]       datetime       NULL,
    CONSTRAINT [PK_dbo.PuntoInteresGeolocalizacion] PRIMARY KEY CLUSTERED ([Id] ASC),
);
