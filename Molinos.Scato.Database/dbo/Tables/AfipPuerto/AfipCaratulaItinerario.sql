CREATE TABLE [dbo].[AfipCaratulaItinerario]
(
    [Id] INT IDENTITY (1, 1) NOT NULL,
	[AfipCaratula_Id] INT NOT NULL , 
    [Puerto] NVARCHAR(5) NOT NULL, 
    CONSTRAINT [FK_dbo.AfipCaratulaItinerario_dbo.AfipCaratula_Id] FOREIGN KEY ([AfipCaratula_Id]) REFERENCES [AfipCaratula]([Id]) ON DELETE CASCADE, 
    CONSTRAINT [PK_AfipCaratulaItinerario] PRIMARY KEY ([Id]) 
)
