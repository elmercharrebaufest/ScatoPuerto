CREATE TABLE [dbo].[ReciboDeBuqueDetalles]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
    [ReciboDeBuque_Id] INT NOT NULL, 
    [Exportador] NVARCHAR(50) NOT NULL, 
    [Cantidad] INT NOT NULL, 
    [PuertoDestino] NVARCHAR(50) NULL, 
    [FechaRecibo] DATETIME NOT NULL, 
    [PuertoOrigen] NVARCHAR(50) NOT NULL, 
    [NombreBuque] NVARCHAR(50) NOT NULL, 
    [CantidadLetrasYClaseCarga] NVARCHAR(200) NOT NULL, 
    [EstibadoEnBodega] NVARCHAR(30) NULL, 
    [CalidadYCantidadDesconocida] NVARCHAR(50) NULL, 
    [IncluirImpresionDestino] BIT NOT NULL DEFAULT 1, 
    [IncluirImpresionCalidad] BIT NOT NULL DEFAULT 1, 
    [IncluirImpresionEstibado] BIT NOT NULL DEFAULT 1,

    CONSTRAINT [PK_dbo.ReciboDeBuqueDetalles] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.Embarque_dbo.ReciboDeBuque_ReciboDeBuque_Id] FOREIGN KEY ([ReciboDeBuque_Id]) REFERENCES [dbo].[ReciboDeBuque] ([Id]),

)
