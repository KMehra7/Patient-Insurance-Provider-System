const moment = require('moment');

module.exports = (date, days) => {
  date = moment.utc(date); // use a clone
  while (days > 0) {
    date = date.add(1, 'days');
    // decrease "days" only if it's a weekday.
    if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
      days -= 1;
    }
  }
  return date;
}