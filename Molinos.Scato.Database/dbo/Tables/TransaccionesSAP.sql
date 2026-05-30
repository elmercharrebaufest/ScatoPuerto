CREATE TABLE [dbo].[TransaccionesSAP]
(
    [Id]                 BIGINT IDENTITY(1,1) NOT NULL,
    [Entidad]            NVARCHAR(100) NOT NULL,
    [Entidad_Id]         BIGINT NOT NULL,
    [Operacion]          NVARCHAR(10) NOT NULL,
    [PayloadXML]         NVARCHAR(MAX) NULL,
    [Estado]             NVARCHAR(50) NOT NULL, -- 'Pendiente', 'Enviado', 'Error'
    [ResponseSAP]        NVARCHAR(MAX) NULL,
    [Reintento]          INT NOT NULL DEFAULT 0,
    [FechaCreacion]      DATETIME NOT NULL DEFAULT GETDATE(),
    [NroNom]             NVARCHAR(MAX) NULL,
    [Usuario]            NVARCHAR(50) NULL,
    
    CONSTRAINT [PK_TransaccionesSAP] PRIMARY KEY CLUSTERED ([Id] ASC)
);