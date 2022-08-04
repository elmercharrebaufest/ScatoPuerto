CREATE TABLE [dbo].[ErroresGeolocalizacion]
(
	[Id]            INT IDENTITY (1, 1) NOT NULL,
   	[Embarque_Id]         INT            NULL,
    [NombreBuque]         VARCHAR(50) NULL,
    [TipoBuque]     VARCHAR(15) NULL,
    [Bandera]       VARCHAR(15) NULL,
    [Imo]       VARCHAR(15) NULL,
    [Mensaje]       varchar(max) NULL,
    [FechaError]   DATETIME NULL,
    CONSTRAINT [PK_dbo.ErroresGeolocalizacion] PRIMARY KEY CLUSTERED ([Id] ASC),
);