CREATE TABLE [dbo].[AfipCoemEstado]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Codigo] NVARCHAR(4) NOT NULL, 
    [Estado] NVARCHAR(50) NOT NULL, 
    [Orden] INT NOT NULL DEFAULT 0, 
    CONSTRAINT [PK_AfipCoemEstado] PRIMARY KEY ([Id]) 
)
