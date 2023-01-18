create table NominacionDatoTecnicoCoordinadorPuerto(
Id int IDENTITY (1, 1) NOT NULL,
CoordinadorPuerto_Id int not null,
Cantidad int ,
NominacionDatoTecnico_Id int not null,
CONSTRAINT [PK_dbo.NominacionDatoTecnicoCoordinadorPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoCoordinadorPuerto_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoCoordinadorPuerto_dbo.CoordinadorPuerto_CoordinadorPuerto_Id] FOREIGN KEY ([CoordinadorPuerto_Id]) REFERENCES [dbo].[CoordinadorPuerto] ([Id]),

)
GO

CREATE TRIGGER [dbo].[Trigger_NominacionDatoTecnicoCoordinadorPuerto]
    ON [dbo].[NominacionDatoTecnicoCoordinadorPuerto]
    FOR  UPDATE
    AS
    BEGIN
        
             declare @idNominacion INT;

    select  @idNominacion = (select n.id from NominacionDatoTecnicoCoordinadorPuerto dtp
    inner join NominacionDatoTecnico dt on dtp.NominacionDatoTecnico_Id = dt.Id
    inner join Nominacion n on dt.Id = n.NominacionDatoTecnico_Id
    where dt.Id = (select id from  deleted))


      IF((select CoordinadorPuerto_Id from deleted) <> (select CoordinadorPuerto_Id from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDatoTecnicoCoordinadorPuerto', 'CoordinadorPuerto_Id', d.CoordinadorPuerto_Id,
	        i.CoordinadorPuerto_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
        IF((select Cantidad from deleted) <> (select Cantidad from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnicoCoordinadorPuerto', 'Cantidad', d.Cantidad,
	            i.Cantidad , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END


    END