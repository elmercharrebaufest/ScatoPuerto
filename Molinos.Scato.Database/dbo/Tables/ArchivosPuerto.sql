CREATE TABLE [dbo].[ArchivosPuerto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [TipoArchivoPuerto_Id] INT NOT NULL, 
    [Usuario_Id] INT NOT NULL, 
    [Embarque_Id] INT NULL, 
    [NombreArchivo] VARCHAR(50) NOT NULL, 
    [Archivo] NVARCHAR(MAX) NULL ,
    [Fecha] DATETIME NULL, 
    CONSTRAINT [PK_dbo.ArchivosPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.Embarque_dbo.Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
    CONSTRAINT [FK_dbo.Embarque_dbo.TipoArchivoPuerto_TipoArchivoPuerto_Id] FOREIGN KEY ([TipoArchivoPuerto_Id]) REFERENCES [dbo].[TipoArchivoPuerto] ([Id])
)
