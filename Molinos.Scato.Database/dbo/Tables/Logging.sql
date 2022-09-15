CREATE TABLE [dbo].[Logging] (
    [Id]                   INT IDENTITY (1, 1) NOT NULL,
	[Servicio]	       NVARCHAR(50)  NOT NULL,
    [Data]            NVARCHAR (MAX) NOT NULL,
    [Tipo] NVARCHAR(10) NOT NULL, 
    [Usuario] NVARCHAR(50) NULL, 
    [Fecha] DATETIME NULL, 
    CONSTRAINT [PK_dbo.Logging] PRIMARY KEY CLUSTERED ([Id] ASC)
);
