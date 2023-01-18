CREATE TABLE [dbo].[Auditoria]
(
    [Id]                 INT              IDENTITY (1, 1) NOT NULL,
    [Nominacion_Id] INT NOT NULL,
    [Entidad_Id] INT NOT NULL,
    [EntidadNombre]			  NVARCHAR (50)   NULL,
    [Propiedad]			  NVARCHAR (50)   NULL,
    [ValorAnterior]		  NVARCHAR (MAX)   NULL,
    [ValorNuevo]          NVARCHAR (MAX)    NULL,
    [FechaModificacion]   DATETIME NOT      NULL,
)
   
