CREATE TABLE [dbo].[AfipCaratulaEstado]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Estado] NVARCHAR(50) NOT NULL, 
    CONSTRAINT [PK_AfipCaratulaEstado] PRIMARY KEY ([Id]) 
)
