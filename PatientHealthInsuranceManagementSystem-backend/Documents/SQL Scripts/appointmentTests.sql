INSERT INTO appointments VALUES (1, 1, '2019-10-06', 540, 570);
INSERT INTO appointments VALUES (1, 1, '2019-10-06', 570, 600);
INSERT INTO appointments VALUES (1, 1, '2019-10-06', 660, 690);
INSERT INTO appointments VALUES (1, 1, '2019-10-06', 690, 720);
INSERT INTO appointments VALUES (1, 1, '2019-10-06', 780, 810);
INSERT INTO appointments VALUES (1, 1, '2019-10-06', 960, 990);
INSERT INTO appointments VALUES (1, 1, '2019-10-06', 990, 1020);
--INSERT INTO appointments VALUES (1, 1, '2019-10-06', 660, 690); -- I Should cause a conflict - Scheduling conflict
--INSERT INTO appointments VALUES (1, 1, '2019-10-07', 520, 560); -- I should cause a conflict - Not on 30 min interval
--INSERT INTO appointments VALUES (1, 1, '2019-10-06', 1020, 1050); -- I should cause a conflict - Appointment too late
--INSERT INTO appointments VALUES (1, 1, '2019-10-06', 510, 540); -- I should cause a conflict - Appointment too early