const candidatesModel = require('../models/candidates.js');

function get(skip, filter, callback) {
  candidatesModel.get(skip, filter, callback);
}

function getById(id, callback) {
  candidatesModel.getById(id, (error, result) => {
    const item = result.map(val => val[0]);
    const res = item[0][0];
    res.emails = item[1].map(val => val.email);
    res.sec_skills = item[2];
    res.other_skills = item[3].map(val => val.skill);
    callback(error, res);
  });
}

function insert(candidate, callback) {
  candidatesModel.insert(candidate, callback);
}

module.exports = {
  get,
  getById,
  insert,
};
