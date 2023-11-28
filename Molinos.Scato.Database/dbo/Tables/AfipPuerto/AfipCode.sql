CREATE TABLE [dbo].[AfipCode]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [IdentificadorCaratula] NVARCHAR(16) NOT NULL, 
    [AfipCaratula_Id] INT NOT NULL, 
    [NumeroViaje] NVARCHAR(16) NOT NULL, 
    CONSTRAINT [PK_AfipCode] PRIMARY KEY ([Id]), 
    CONSTRAINT [FK_dbo.AfipCode_dbo.AfipCaratula_Id] FOREIGN KEY ([AfipCaratula_Id]) REFERENCES [AfipCaratula]([Id]) ON DELETE CASCADE
)
