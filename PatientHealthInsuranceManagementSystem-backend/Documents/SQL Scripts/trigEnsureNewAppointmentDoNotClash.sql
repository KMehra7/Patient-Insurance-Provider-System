CREATE TRIGGER ensureNewAppointmentsDoNotClash ON appointments
INSTEAD OF INSERT
AS
BEGIN
	DECLARE @did INT,
			@appointmentdate DATE,
			@starttime INT,
			@endtime INT

	SELECT	@did = did,
			@appointmentdate = appointmentdate,
			@starttime = starttime,
			@endtime = endtime

	FROM INSERTED
		IF NOT dbo.slotIsAvailable(@did, @appointmentdate, @starttime, @endtime) = 1
			BEGIN
				RAISERROR('Appointment clashes with an existing appointment!', 16, 1);
				ROLLBACK TRANSACTION
			END
		ELSE
			BEGIN
				DECLARE @t TABLE (
					did INT,
					pid INT,
					appointmentdate DATE,
					starttime INT,
					endtime INT
				)
				INSERT INTO appointments(did, pid, appointmentdate, starttime, endtime)
				SELECT did, pid, appointmentdate, startTime, endTime FROM INSERTED
			END
END; 
GO