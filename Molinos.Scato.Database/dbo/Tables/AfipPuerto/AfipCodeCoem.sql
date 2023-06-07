CREATE TABLE [dbo].[AfipCodeCoem]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [AfipCode_Id] INT NOT NULL, 
    [AfipCoem_Id] INT NOT NULL, 
    CONSTRAINT [PK_AfipCodeCoem] PRIMARY KEY ([Id]), 
    CONSTRAINT [FK_dbo.AfipCodeCoem_dbo.AfipCode_Id] FOREIGN KEY ([AfipCode_Id]) REFERENCES [AfipCode]([Id]), 
    CONSTRAINT [FK_dbo.AfipCodeCoem_dbo.AfipCoem_Id] FOREIGN KEY ([AfipCoem_Id]) REFERENCES [AfipCoem]([Id])
)
