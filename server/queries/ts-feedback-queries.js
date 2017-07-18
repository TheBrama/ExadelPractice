function getTsFeedbacksByCandidateId(id) {
  return `SELECT t_f.id, u.first_name, u.second_name, v.name, s.skill_name, t_f.primary_skill_lvl FROM ts_feedback t_f
  LEFT JOIN skills s ON t_f.primary_skill_id = s.id
  LEFT JOIN candidate c ON t_f.candidate_id = c.id
  LEFT JOIN users u ON t_f.user_id = u.id
  LEFT JOIN vacancy v ON v.id = t_f.vacancy_id
  WHERE ${id} = t_f.candidate_id`;
}
function getSecondarySkillsByTsFeedbackId(id) {
  return `SELECT skills.skill_name, ts_secondary_skills.skill_lvl FROM ts_secondary_skills
  LEFT JOIN skills ON ts_secondary_skills.skill_id = skills.id
  WHERE ${id} = ts_secondary_skills.ts_feedback_id`;
}
function addTsFeedback(object) {
  return `INSERT INTO ts_feedback
  (primary_skill_id, primary_skill_lvl, candidate_id, vacancy_id, user_id)
  VALUES ('${object.primary_skill_id}', '${object.primary_skill_lvl}',
  '${object.candidate_id}', '${object.vacancy_id}', '${object.user_id}')`;
}
function addTsSecondarySkills(item, id) {
  console.log(item);
  return `INSERT INTO ts_secondary_skills
  (ts_feedback_id, skill_lvl, skill_id)
  VALUES ('${id}', '${item.skill_lvl}', '${item.skill_id}')`;
}
function addEventToGeneralHistory(id) {
  return `INSERT INTO general_history (ts_feedback_id, change_date)
  VALUES ('${id}', NOW())`;
}


module.exports = {
  getTsFeedbacksByCandidateId,
  addTsFeedback,
  addTsSecondarySkills,
  addEventToGeneralHistory,
  getSecondarySkillsByTsFeedbackId,
};

/* LEFT JOIN ts_secondary_skills t_s_s ON t_f.id = t_s_s.ts_feedback_id
  LEFT JOIN skills ON skills.id = t_s_s.skill_id */

