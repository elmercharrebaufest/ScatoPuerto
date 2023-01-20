create table Senasa(
  Id                      int IDENTITY (1, 1) NOT NULL,
  NominacionDetalleIntervencion_Id int NOT NULL,
  Exportador_Id           int NOT NULL,
  TieneSenasa             bit NOT NULL,
  Consumo                 varchar(20) ,
  ACuentaDe               varchar(20) ,
  Destino_Id              int,
  IP                      BIT,
  GMO                     BIT,
  FITO                    BIT,
  MuestraOficial          BIT,
  CertificadoInocuidad    BIT,
  CertificadoVeterinario  BIT,
  Observaciones           varchar(500)
  CONSTRAINT [PK_dbo.Senasa] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_NominacionDetalleIntervencion_Id] FOREIGN KEY ([NominacionDetalleIntervencion_Id]) REFERENCES [dbo].[NominacionDetalleIntervencion] ([Id]),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [dbo].[Destino] ([Id]),

)
GO

CREATE TRIGGER [dbo].[Trigger_Senasa]
    ON [dbo].[Senasa]
    FOR  UPDATE
    AS
    BEGIN
           
             declare @idNominacion INT;
    select  @idNominacion = (select n.id from Senasa s 
    inner join  NominacionDetalleIntervencion di on s.NominacionDetalleIntervencion_Id = di.Id
    inner join Nominacion n on di.Id = n.NominacionDetalleIntervencion_Id
    where s.Id = (select id from  deleted))


      IF((select Exportador_Id from deleted) <> (select Exportador_Id from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'Exportador_Id', d.Exportador_Id,
	        i.Exportador_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

         IF((select TieneSenasa from deleted) <> (select TieneSenasa from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'TieneSenasa', d.TieneSenasa,
	        i.TieneSenasa , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

          IF((select Consumo from deleted) <> (select Consumo from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'Consumo', d.Consumo,
	        i.Consumo , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

          IF((select ACuentaDe from deleted) <> (select ACuentaDe from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'ACuentaDe', d.ACuentaDe,
	        i.ACuentaDe , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

          IF((select Destino_Id from deleted) <> (select Destino_Id from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'Destino_Id', d.Destino_Id,
	        i.Destino_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

          IF((select IP from deleted) <> (select IP from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'IP', d.IP,
	        i.IP , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
      
      IF((select GMO from deleted) <> (select GMO from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'GMO', d.GMO,
	        i.GMO , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

        IF((select FITO from deleted) <> (select FITO from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'FITO', d.FITO,
	        i.FITO , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

        IF((select CertificadoInocuidad from deleted) <> (select CertificadoInocuidad from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'CertificadoInocuidad', d.CertificadoInocuidad,
	        i.CertificadoInocuidad , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

        IF((select CertificadoVeterinario from deleted) <> (select CertificadoVeterinario from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'CertificadoVeterinario', d.CertificadoVeterinario,
	        i.CertificadoVeterinario , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

        IF((select Observaciones from deleted) <> (select Observaciones from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'Senasa', 'Observaciones', d.Observaciones,
	        i.Observaciones , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END



    END