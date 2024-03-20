CREATE TABLE [dbo].[Auditoria]
(
    [Id]                 INT              IDENTITY (1, 1) NOT NULL,
    [Nominacion_Id] INT NULL,
    [Entidad_Id] INT NULL,
    [EntidadNombre]			  NVARCHAR (50)   NULL,
    [Propiedad]			  NVARCHAR (50)   NULL,
    [ValorAnterior]		  NVARCHAR (MAX)   NULL,
    [ValorNuevo]          NVARCHAR (MAX)    NULL,
    [FechaModificacion]   DATETIME NOT      NULL, 
    [UsuarioEjecuta] VARCHAR(40) NULL, 
    [Accion] VARCHAR(180) NULL,
)
   
