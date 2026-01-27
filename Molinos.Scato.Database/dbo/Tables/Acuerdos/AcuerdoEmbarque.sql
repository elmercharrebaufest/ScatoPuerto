CREATE TABLE [dbo].[AcuerdoEmbarque](
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[AcuerdoDetalle_Id] INT NOT NULL,
	[Embarque_Id] INT NOT NULL,
	[Cantidad] DECIMAL(18, 3) NOT NULL,
	CONSTRAINT [Pk_AcuerdoEmbarque] PRIMARY KEY ([Id]),
	CONSTRAINT [Fk_AcuerdoEmbarque_AcuerdoDetalle] FOREIGN KEY ([AcuerdoDetalle_Id]) REFERENCES [dbo].[AcuerdoDetalle]([Id]),
	CONSTRAINT [Fk_AcuerdoEmbarque_Embarque] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque]([Id])
);