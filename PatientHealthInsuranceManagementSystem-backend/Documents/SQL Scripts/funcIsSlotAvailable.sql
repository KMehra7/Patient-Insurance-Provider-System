CREATE FUNCTION slotIsAvailable(
    @did INT,
	@slotAppointmentDate DATE,
    @slotStartTime INT,
    @slotEndTime INT
) RETURNS BIT 
BEGIN
    RETURN CASE WHEN EXISTS (
        SELECT 'TRUE'
        FROM appointments AS a
        WHERE
			@slotStartTime < a.endtime AND 
			@slotEndTime > a.starttime AND
			a.did = @did AND
			a.appointmentdate = @slotAppointmentDate
    ) THEN 'FALSE' ELSE 'TRUE'
    END;
END; 
GO
