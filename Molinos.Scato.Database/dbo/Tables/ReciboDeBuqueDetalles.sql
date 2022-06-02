CREATE TABLE [dbo].[ReciboDeBuqueDetalles]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
    [ReciboDeBuque_Id] INT NOT NULL, 
    [Exportador] NVARCHAR(50) NOT NULL, 
    [Cantidad] NVARCHAR(50) NOT NULL, 
    [PuertoDestino] NVARCHAR(50) NOT NULL, 
    [FechaRecibo] NVARCHAR(50) NULL, 
    [PuertoOrigen] NVARCHAR(50) NULL, 
    [NombreBuque] NVARCHAR(50) NULL, 
    [CantidadLetrasYClaseCarga] NVARCHAR(200) NOT NULL, 
    [EstibadoEnBodega] NVARCHAR(30) NULL, 
    [CalidadYCantidadDesconocida] NVARCHAR(50) NULL, 
    [IncluirImpresionDestino] BIT NOT NULL, 
    [IncluirImpresionCalidad] BIT NOT NULL, 
    [IncluirImpresionEstibado] BIT NOT NULL,

    CONSTRAINT [PK_dbo.ReciboDeBuqueDetalles] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.Embarque_dbo.ReciboDeBuque_ReciboDeBuque_Id] FOREIGN KEY ([ReciboDeBuque_Id]) REFERENCES [dbo].[ReciboDeBuque] ([Id]),

)
