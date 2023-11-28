CREATE TABLE [dbo].[AfipCoemContenedorConCarga]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [AfipCoem_Id] INT NOT NULL, 
    [IdentificadorContenedor] NVARCHAR(11) NOT NULL, 
    [CuitATA] NVARCHAR(11) NULL, 
    [Tipo] NVARCHAR(1) NOT NULL, 
    [Peso] DECIMAL(18, 2) NOT NULL, 
    CONSTRAINT [PK_AfipCoemContenedorConCarga] PRIMARY KEY ([Id]), 
    CONSTRAINT [FK_dbo.AfipCoemContenedorConCarga_dbo.AfipCoem_Id] FOREIGN KEY ([AfipCoem_Id]) REFERENCES [AfipCoem]([Id]) ON DELETE CASCADE
)
