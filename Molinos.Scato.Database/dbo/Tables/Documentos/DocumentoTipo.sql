CREATE TABLE [dbo].[DocumentoTipo]
(
	Id INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
	CONSTRAINT [PK_DocumentoTipo] PRIMARY KEY ([Id])
)
