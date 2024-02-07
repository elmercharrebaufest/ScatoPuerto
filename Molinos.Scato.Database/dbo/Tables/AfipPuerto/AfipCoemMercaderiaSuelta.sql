CREATE TABLE [dbo].[AfipCoemMercaderiaSuelta]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [AfipCoem_Id] INT NOT NULL, 
    [IdentificadorDeclaracion] NVARCHAR(16) NULL, 
    [CuitATA] NVARCHAR(11) NULL, 
    [NoABordo] BIT NOT NULL DEFAULT 0, 
    CONSTRAINT [PK_AfipCoemMercaderiaSuelta] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.AfipCoemMercaderiaSuelta_dbo.AfipCoem_Id] FOREIGN KEY ([AfipCoem_Id]) REFERENCES [AfipCoem]([Id]) ON DELETE CASCADE
)
