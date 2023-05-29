CREATE TABLE [dbo].[AfipCoem]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [IdentificadorCOEM] NVARCHAR(16) NOT NULL, 
    [IdentificadorCaratula] NVARCHAR(16) NOT NULL, 
    [AfipCoemEstado_Id] INT NOT NULL,
    [AfipCaratula_Id] INT NOT NULL, 
    [FechaRegistro] DATETIME NOT NULL, 
    CONSTRAINT [PK_AfipCoem] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.AfipCoem_dbo.AfipCoemEstado_Id] FOREIGN KEY ([AfipCoemEstado_Id]) REFERENCES [AfipCoemEstado]([Id]) ON DELETE CASCADE, 
    CONSTRAINT [FK_dbo.AfipCoem_dbo.AfipCaratula_Id] FOREIGN KEY ([AfipCaratula_Id]) REFERENCES [AfipCaratula]([Id]) ON DELETE CASCADE
)
