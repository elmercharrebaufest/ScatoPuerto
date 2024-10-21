CREATE TABLE [dbo].[NominacionDocumentoComentario]
(
	Id INT IDENTITY(1,1) NOT NULL,
    NominacionDocumento_Id INT NOT NULL,
    Usuario NVARCHAR(50) NOT NULL,
    Comentario NVARCHAR(MAX) NOT NULL,
    Fecha DATETIME NOT NULL,
    CONSTRAINT [PK_NominacionDocumentoComentario] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.NominacionDocumentoComentario_dbo.NominacionDocumento_Id] FOREIGN KEY (NominacionDocumento_Id) REFERENCES NominacionDocumento(Id)
)
