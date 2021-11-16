CREATE TABLE [dbo].[Contingencia] (
    [Id]                INT IDENTITY (1, 1) NOT NULL,
    [TipoContingencia]		NVARCHAR(MAX)       NOT NULL,
    [Fecha]             NVARCHAR(MAX) NOT NULL,
	[Usuario]        NVARCHAR(MAX) NOT NULL,
    [Activado]          BIT NOT NULL,
	[Motivo]        NVARCHAR(MAX) NOT NULL,
    CONSTRAINT [PK_dbo.Contingencia] PRIMARY KEY CLUSTERED ([Id] ASC)
);

