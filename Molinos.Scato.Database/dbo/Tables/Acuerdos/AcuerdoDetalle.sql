CREATE TABLE [dbo].[AcuerdoDetalle]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[Acuerdo_Id] INT NOT NULL, 
	[MaterialPuerto_Id] INT NOT NULL,
	[Cantidad] DECIMAL(18, 3) NOT NULL, 
	CONSTRAINT [Pk_AcuerdoDetalle] PRIMARY KEY ([Id]),
	CONSTRAINT [Fk_AcuerdoDetalle_Acuerdo] FOREIGN KEY ([Acuerdo_Id]) REFERENCES [dbo].[Acuerdo]([Id]),
	CONSTRAINT [Fk_AcuerdoDetalle_MaterialPuerto] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto]([Id])
);
