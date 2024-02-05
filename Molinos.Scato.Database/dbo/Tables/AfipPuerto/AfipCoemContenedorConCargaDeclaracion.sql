CREATE TABLE [dbo].[AfipCoemContenedorConCargaDeclaracion]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [AfipCoemContenedorConCarga_Id] INT NOT NULL, 
    [IdentificadorDeclaracion] NVARCHAR(16) NOT NULL, 
    CONSTRAINT [PK_AfipCoemContenedorConCargaDeclaracion] PRIMARY KEY ([Id]), 
    CONSTRAINT [FK_dbo.AfipCoemContenedorConCargaDeclaracion_dbo.AfipCoemContenedorConCarga_Id] FOREIGN KEY ([AfipCoemContenedorConCarga_Id]) REFERENCES [AfipCoemContenedorConCarga]([Id]) ON DELETE CASCADE
)
