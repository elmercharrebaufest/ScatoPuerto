CREATE TABLE [dbo].[ReciboDeBuque]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
    [Embarque_Id] INT NOT NULL, 
    [NumeroRecibo] INT NOT NULL, 
    [Estado] NVARCHAR(50) NOT NULL, 
    [Emitio] NVARCHAR(50) NOT NULL, 
    [FechaHoraImpresion] DATETIME NULL,

    [Superviso] NVARCHAR(50) NULL, 
    [Habilitado] BIT NOT NULL DEFAULT 1, 
    CONSTRAINT [PK_dbo.ReciboDeBuque] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.Embarque_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
)
