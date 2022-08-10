CREATE TABLE [dbo].[TipoArchivoPuerto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
    [TipoArchivo] NVARCHAR(50) NOT NULL

	CONSTRAINT [PK_dbo.TipoArchivoPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
)

