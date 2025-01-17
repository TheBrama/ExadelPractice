const calendar = require('../notification/calendar.js');
const interviewDao = require('../dao/interviews');
const gmail = require('../notification/gmail');
const utils = require('../../utils');

function editDoneField(obj) {
  if (obj.done) {
    obj.done = 'Closed';
  } else {
    obj.done = 'Open';
  }
  return obj;
}

function editDoneFields(arr) {
  return arr.map(item => editDoneField(item));
}

function editAndSendMail(obj) {
  const camelRes = utils.toCamel(obj);
  const resp = utils.namesEditor.editArr(camelRes);
  utils.dateFormatter.format(resp);
  gmail.sendMail(resp[0]);
}
function insertEventInGoogleCalendar(obj) {
  const camelRes = utils.toCamel(obj);
  const event = {};
  event.date = new Date(camelRes[0].date);
  calendar.setCalendarId(camelRes[0].login);
  calendar.setStaticEvent(event);
  calendar.insertEventInGoogleCal();
}

function insert(object, callback) {
  utils.dateFormatter.format(object);
  interviewDao.insert(utils.toSnake(object), (error, result) => {
    if (error) {
      throw error;
    }
    interviewDao.getEmailNotificationData(result,
      (err, res) => {
        editAndSendMail(res);
        insertEventInGoogleCalendar(res);
        callback(err);
      });
  });
}

function getByUserId(id, callback) {
  interviewDao.getByUserId(id, (err, res) => {
    if (err) {
      throw err;
    }
    let result = utils.toCamel(res);
    result = utils.dateFormatter.formatArr(result);
    callback(err, utils.namesEditor.editArr(result));
  });
}

function getByCandidateId(id, callback) {
  interviewDao.getByCandidateId(id, (err, res) => {
    if (err) {
      throw err;
    }
    let result = utils.toCamel(res);
    result = utils.dateFormatter.formatArr(result);
    result = editDoneFields(result);
    callback(err, utils.namesEditor.editArr(result));
  });
}

module.exports = {
  insert,
  getByUserId,
  getByCandidateId,
};
