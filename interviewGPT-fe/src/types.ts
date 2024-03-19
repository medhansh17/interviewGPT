const sampleFetchSkillsData = {
	"message": "Data retrieved successfully",
	"skills": {
		"experience": ": 5-8 years",
		"soft_skills": [
			"Ability to work well individually and in a group setting",
			"Ability to work under pressure and deadlines",
			"Good Communication Skills"
		],
		"technical_skills": [
			"Knowledge of Functional and OO JavaScriptES6",
			"Web Applications development using HTML and CSS with JavaScript Frameworks like Reactjs",
			"VueJs and sveltejs",
			"Understanding of Typescript and type language concepts",
			"Experience with server side rendered apps frameworks like Nextjs or Nuxtjs",
			"Experience with JavaScript state Management libraries such as Redux or Mobx"
		]
	}
}

export type FetchSkillsData = typeof sampleFetchSkillsData;
