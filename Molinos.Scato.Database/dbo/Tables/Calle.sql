CREATE TABLE [dbo].[Calle] (
    [Id]                        INT            IDENTITY (1, 1) NOT NULL,
    [Nombre]                    NVARCHAR (35) NOT NULL,
    [Codigo] NCHAR(5) NOT NULL, 
    [CentroId] INT NOT NULL, 
    CONSTRAINT [PK_dbo.Calle] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.Calle_dbo.Calle_Centro_Id] FOREIGN KEY ([CentroId]) REFERENCES [dbo].[Centro] ([Id])
);