CREATE TABLE [dbo].[NominacionDocumentoArchivo]
(
	Id INT IDENTITY(1,1) NOT NULL,
    NominacionDocumento_Id INT NOT NULL,
    Usuario NVARCHAR(50) NOT NULL,
    Nombre NVARCHAR(255) NOT NULL,
    Ubicacion NVARCHAR(300) NOT NULL,
    FechaSubida DATETIME NOT NULL,
    CONSTRAINT [PK_NominacionDocumentoArchivo] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.NominacionDocumentoArchivo_dbo.NominacionDocumento_Id] FOREIGN KEY (NominacionDocumento_Id) REFERENCES NominacionDocumento(Id)
)
