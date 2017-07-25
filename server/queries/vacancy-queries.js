/** All Vacancies */

const capacity = 5;

const getVacancies = (limit, filter) => {
  const query = [];
  let sent = 'WHERE ';
  if (filter) {
    Object.keys(filter).forEach((key, i) => {
      if (i === 1) {
        sent = ' AND ';
      }
      if (key === 'english_lvl') {
        query[i] = `${sent}vacancy.${key} >= ${filter[key][0]}`;
        return;
      }
      if (key === 'salary_wish') {
        query[i] = `${sent}vacancy.${key} >= ${filter[key][0]} 
        AND vacancy.${key} <= ${filter[key][1]}`;
        return;
      }
      if (key === 'exp_year') {
        query[i] = `${sent}vacancy.${key} <= ${filter[key][0]}`;
        return;
      }
      query[i] = `${sent}vacancy.${key} = ${filter[key]}`;
    });
  }
  return `SELECT vacancy.id, vacancy.name, vacancy.request_date, vacancy.start_date,
  skills.skill_name,  vacancy.primary_skill_lvl, location.city, vacancy_status.status FROM vacancy 
  LEFT JOIN skills ON vacancy.id = skills.id
  LEFT JOIN location ON vacancy.city = location.id
  LEFT JOIN vacancy_status ON vacancy.status = vacancy_status.id 
  ${query.join('')}
  GROUP BY vacancy.id
  LIMIT ${limit}, ${capacity}`;
};

/** Single Vacancy */

const getVacancy = id =>
  `SELECT vacancy.id, vacancy.name, vacancy.request_date, vacancy.start_date,
  skills.skill_name,  vacancy.primary_skill_lvl, location.city, vacancy_status.status FROM vacancy 
  LEFT JOIN skills ON vacancy.id = skills.id
  LEFT JOIN location ON vacancy.city = location.id
  LEFT JOIN vacancy_status ON vacancy.status = vacancy_status.id 
  WHERE vacancy.id = ${id}`;

const getSecondarySkills = id =>
  `SELECT skills.skill_name, vacancy_secondary_skills.lvl
  FROM vacancy_secondary_skills
  LEFT JOIN skills ON vacancy_secondary_skills.skill_id = skills.id
  WHERE  vacancy_secondary_skills.vacancy_id = ${id}`;

const getOtherSkills = id =>
  `SELECT other_skills.skill, other_skills.id 
  FROM other_skills_has_vacancy
  LEFT JOIN other_skills ON other_skills_has_vacancy.other_skills_id = other_skills.id
  WHERE other_skills_has_vacancy.vacancy_id = ${id}`;

const updateVacancy = id => `UPDATE vacancy SET ? WHERE id = ${id}`;

const deleteSecondarySkills = id =>
  `DELETE FROM vacancy_secondary_skills WHERE vacancy_id = ${id}`;

const insertSecSkill = (id, skill) =>
  `INSERT INTO vacancy_secondary_skills (vacancy_id, skill_id, lvl)
    VALUES (${id}, ${skill.id}, ${skill.lvl})`;

const commitChanges = () => 'INSERT INTO vacancy_changes SET ?';

const generalHistory = (id, date) =>
  `INSERT INTO general_history (vacancy_change_id, change_date)
  VALUES (${id},'${date}')`;

const deleteOtherSkills = id =>
  `DELETE FROM other_skills_has_vacancy WHERE vacancy_id = ${id}`;

const insertOtherSkill = (id, skillId) =>
  `INSERT INTO other_skills_has_vacancy (vacancy_id, other_skills_id)
    VALUES (${id}, ${skillId})`;

const addVacancy = vacancy =>
  `INSERT INTO vacancy (name, request_date, start_date, primary_skill, primary_skill_lvl, city, 
    status, linkedin, exp_year, english_lvl, salary_wish)
    VALUES ('${vacancy.name}', '${vacancy.request_date}','${vacancy.start_date}', '${vacancy.primary_skill}',
    ${vacancy.primary_skill_lvl}, '${vacancy.city}', ${vacancy.status},'${vacancy.linkedin}', 
    '${vacancy.exp_year}', '${vacancy.english_lvl}', '${vacancy.salary_wish}')`;

const getSkillsId = vacancyId =>
  `SELECT skill_id, lvl 
  FROM vacancy_secondary_skills
  WHERE vacancy_id = ${vacancyId}`;

const getCandidatesBySkill = (skill) => {
  console.log(skill);
  return `SELECT candidate_id ,lvl, skill_id
  FROM candidate_secondary_skills
  WHERE skill_id = ${skill.skill_id}`;
};

module.exports = {
  getVacancies,
  getVacancy,
  getOtherSkills,
  getSecondarySkills,
  getSkillsId,
  getCandidatesBySkill,
  generalHistory,
  commitChanges,
  updateVacancy,
  deleteOtherSkills,
  deleteSecondarySkills,
  insertOtherSkill,
  insertSecSkill,
  addVacancy,
};
