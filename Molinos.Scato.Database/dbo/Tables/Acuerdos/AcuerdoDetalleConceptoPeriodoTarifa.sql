CREATE TABLE [dbo].[AcuerdoDetalleConceptoPeriodoTarifa]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[AcuerdoDetalleConcepto_Id] INT NOT NULL,
	[AcuerdoPeriodo_Id] INT NOT NULL,
	[ValorTarifa] DECIMAL(15, 3) NOT NULL,
	CONSTRAINT [Pk_AcuerdoDetalleConceptoPeriodoTarifa] PRIMARY KEY ([Id]),
	CONSTRAINT [Fk_AcuerdoDetalleConceptoPeriodoTarifa_AcuerdoDetalleConcepto] FOREIGN KEY ([AcuerdoDetalleConcepto_Id]) REFERENCES [dbo].[AcuerdoDetalleConcepto]([Id]),
	CONSTRAINT [Fk_AcuerdoDetalleConceptoPeriodoTarifa_AcuerdoPeriodo] FOREIGN KEY ([AcuerdoPeriodo_Id]) REFERENCES [dbo].[AcuerdoPeriodo]([Id])
)
