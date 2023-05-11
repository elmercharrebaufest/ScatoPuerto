CREATE TABLE [dbo].[AfipCaratulaItinerario]
(
	[IdentificadorCaratula] NVARCHAR(16) NOT NULL , 
    [Puerto] NVARCHAR(5) NOT NULL, 
    CONSTRAINT [FK_dbo.AfipCaratulaItinerario_dbo.AfipCaratula_IdentificadorCaratula] FOREIGN KEY ([IdentificadorCaratula]) REFERENCES [AfipCaratula]([Id]) 
)
