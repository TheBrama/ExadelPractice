const metaphone = require('metaphone');
const async = require('async');

const candidatesModel = require('../dao/candidates');
const utils = require('../../utils');

function mapRes(error, result, callback) {
  if (result) {
    result = utils.namesEditor.editArr(utils.toCamel(result));
  }
  callback(error, result);
}

function get(paramsCamel, callback) {
  const params = utils.dateFormatter.format(utils.toSnake(paramsCamel));
  const skip = paramsCamel.skip;
  const amount = paramsCamel.amount;
  let filter = params;
  delete filter.skip;
  delete filter.amount;
  utils.clearFields(filter);
  if (Object.keys(filter).length === 0) {
    filter = undefined;
  }
  candidatesModel.get(skip, amount, filter, (err, res) => mapRes(err, res, callback));
}

function getById(id, callback) {
  candidatesModel.getById(id, (error, result) => {
    const item = result.map(val => val[0]);
    let res = item[0][0];
    if (!res) {
      result = 'No such candidate';
      return callback(error, result);
    }
    res = utils.toCamel(res);
    utils.namesEditor.mapNames(res);
    res.emails = item[1].map(val => val.email);
    res.secSkills = item[2];
    res.otherSkills = item[3];
    callback(error, utils.clearFields(utils.toCamel(res)));
  });
}

function insert(candidateCamel, callback) {
  const candidate = utils.dateFormatter.format(utils.toSnake(candidateCamel));
  const emails = candidate.emails || [];
  const secSkills = candidate.sec_skills || [];
  const oSkills = candidate.other_skills || [];
  const item = candidate;
  const firstName = utils.translit(item.eng_first_name);
  if (firstName !== item.eng_first_name) {
    item.ru_first_name = item.eng_first_name;
    item.ru_second_name = item.eng_second_name;
    item.eng_first_name = firstName;
    item.eng_second_name = utils.translit(item.eng_second_name);
  }
  const meta = {
    first: metaphone(item.eng_first_name),
    second: metaphone(item.eng_second_name),
  };
  delete item.emails;
  delete item.sec_skills;
  delete item.other_skills;
  candidatesModel.insert(item, emails, secSkills, oSkills, meta, callback);
}

function update(id, candidateCamel, user, callback) {
  const candidate = utils.dateFormatter.format(utils.toSnake(candidateCamel));
  const changes = {};
  Object.keys(candidate).forEach((key) => {
    changes[`${key}`] = 1;
  });
  if (candidate.primary_skill_lvl) {
    delete changes.primary_skill_lvl;
    changes.primary_skill = 1;
  }
  changes.candidate_id = id;
  changes.user_id = user;
  const emails = candidate.emails || [];
  const secSkills = candidate.sec_skills || [];
  const oSkills = candidate.other_skills || [];
  const item = candidate;
  const firstName = utils.translit(item.eng_first_name);
  if (firstName !== item.eng_first_name) {
    item.ru_first_name = item.eng_first_name;
    item.ru_second_name = item.eng_second_name;
    item.eng_first_name = firstName;
    item.eng_second_name = utils.translit(item.eng_second_name);
  }
  const meta = {
    first: metaphone(item.eng_first_name),
    second: metaphone(item.eng_second_name),
    candidate_id: id,
  };
  delete item.emails;
  delete item.sec_skills;
  delete item.other_skills;
  delete item.change_date;
  candidatesModel.update(id, item, emails, secSkills, oSkills, changes, meta, callback);
}

function search(query, bodyCamel, callback) {
  if (!query.q) {
    return get(bodyCamel, callback);
  }
  const body = utils.dateFormatter.format(utils.toSnake(bodyCamel));
  const skip = bodyCamel.skip;
  const amount = bodyCamel.amount;
  let filter = body;
  delete filter.skip;
  delete filter.amount;
  utils.clearFields(filter);
  let params = query.q.split(' ');
  if (params.length > 2) {
    params = params.slice(1, 3);
  }
  const paramsName = params.map(val => metaphone(utils.translit(val)));
  if (Object.keys(filter).length === 0) {
    filter = undefined;
  }
  async.parallel([
    call => candidatesModel.search(paramsName, skip, amount, filter, (err, res) =>
      mapRes(err, res, call)),
    call => candidatesModel.searchByEmail(params[0], skip, amount, filter, (err, res) =>
      mapRes(err, res, call)),
    call => candidatesModel.searchBySkype(params[0], skip, amount, filter, (err, res) =>
      mapRes(err, res, call))],
    (err, res) => {
      if (err) {
        callback(err);
        throw err;
      }
      let result = [];
      res.forEach((val) => {
        result = result.concat(val);
      });
      callback(err, result);
    });
}
/*  if (query.candidate) {
    let params = query.candidate.split(' ');
    if (params.length > 2) {
      params = params.slice(1, 3);
    }
    params = params.map(val => metaphone(utils.translit(val)));
    return candidatesModel.search(params, skip, amount, filter, (err, res) =>
      mapRes(err, res, callback));
  }
  if (query.email) {
    const params = query.email.split(' ')[0];
    return candidatesModel.searchByEmail(params, skip, amount, filter, (err, res) =>
      mapRes(err, res, callback));
  }
  if (query.skype) {
    const params = query.skype.split(' ')[0];
    return candidatesModel.searchBySkype(params, skip, amount, filter, (err, res) =>
      mapRes(err, res, callback));
  }
  return callback();
}*/

function report(paramsCamel, callback) {
  const params = utils.dateFormatter.format(utils.toSnake(paramsCamel));
  const span = paramsCamel.span ? utils.dateFormatter.format(paramsCamel.span) : undefined;
  let filter = params;
  delete filter.span;
  if (Object.keys(filter).length === 0) {
    filter = undefined;
  }
  candidatesModel.report(span, filter, (err, res) => {
    if (res) {
      res = utils.namesEditor.editArr(utils.toCamel(res));
    }
    var Readable = require('stream').Readable;
    var s = new Readable();
    s._read = function noop() {}; // redundant? see update below
    s.push(require('json2xls')(res));
    s.push(null);
    callback(err, s);
  });
}

module.exports = {
  get,
  getById,
  insert,
  update,
  search,
  report,
};
