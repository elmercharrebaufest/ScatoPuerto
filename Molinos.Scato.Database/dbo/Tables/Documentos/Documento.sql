CREATE TABLE [Documento] (
    Id INT IDENTITY(1,1) NOT NULL,
    DocumentoTipo_Id INT NOT NULL,
    Nombre NVARCHAR(255) NOT NULL,
    [Liquido] BIT NOT NULL DEFAULT 0,
    [Solido] BIT NOT NULL DEFAULT 0,
    [Activo] BIT NOT NULL DEFAULT 1, 
    CONSTRAINT [PK_Documento] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.Documento_dbo.DocumentoTipo_Id] FOREIGN KEY (DocumentoTipo_Id) REFERENCES DocumentoTipo(Id)
)