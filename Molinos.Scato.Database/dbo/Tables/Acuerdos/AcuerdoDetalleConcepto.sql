CREATE TABLE [dbo].[AcuerdoDetalleConcepto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[AcuerdoDetalle_Id] INT NOT NULL,
	[Concepto_Id] INT NOT NULL,
	CONSTRAINT [Pk_AcuerdoDetalleConcepto] PRIMARY KEY ([Id]),
	CONSTRAINT [Fk_AcuerdoDetalleConcepto_AcuerdoDetalle] FOREIGN KEY ([AcuerdoDetalle_Id]) REFERENCES [dbo].[AcuerdoDetalle]([Id]),
	CONSTRAINT [Fk_AcuerdoDetalleConcepto_Concepto] FOREIGN KEY ([Concepto_Id]) REFERENCES [dbo].[Concepto]([Id])
)
