CREATE TABLE [dbo].[AfipCoemContenedorConCargaPrecinto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [AfipCoemContenedorConCarga_Id] INT NOT NULL, 
    [IdentificadorPrecinto] NVARCHAR(20) NOT NULL, 
    CONSTRAINT [PK_AfipCoemContenedorConCargaPrecinto] PRIMARY KEY ([Id]), 
    CONSTRAINT [FK_dbo.AfipCoemContenedorConCargaPrecinto_dbo.AfipCoemContenedorConCarga_Id] FOREIGN KEY ([AfipCoemContenedorConCarga_Id]) REFERENCES [AfipCoemContenedorConCarga]([Id]) ON DELETE CASCADE 
)
