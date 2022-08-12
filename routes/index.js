const express = require('express');
const router = express.Router();
const db = require('../models/controller')
const fs = require('fs');
const converter = require('json-2-csv');
var ObjectId = require('mongodb').ObjectId;

router.get('/', async (req, res) => {
	let userCount
	let historiesCount
	let labelsData = [];
	let chartData = []

	userCount = await db.usersCount()
	historiesCount = await db.historiesCount()

	const allData = db.allHistories()
	let hisResult = await allData
	var monthArr = []
	for (i = 0; i < hisResult.length; i++) {
		let dateArray = hisResult[i].createdAt
		let month = JSON.stringify(dateArray).split('-')
		monthArr.push(month[1])
	}

	labelsData = monthArr.filter(function (item, pos) {
		return monthArr.indexOf(item) == pos;
	});

	const arr = monthArr;
	const count = {};

	arr.forEach(element => {
		count[element] = (count[element] || 0) + 1;
	});

	chartData = Object.values(count)

	const result = await db.select10UsersAndHistories()

	context = {
		result,
		userCount,
		historiesCount,
		index: true,
		labelsData,
		chartData,
	}

	res.render('index', context)
});

router.get('/users/:page', async (req, res) => {
	let pageList = []
	const resultsPerPage = 10;
	let page = req.params.page >= 1 ? req.params.page : 1;
	page = page - 1

	db.usersCount((err, result) => { })
	const result = await db.selectAllUsers(page, resultsPerPage)

	for (i = 0; i < Math.ceil(result.totalUsers / resultsPerPage); i++) {
		pageList.push(i + 1)
	}

	res.render('user/allUser', {
		result,
		users: true,
		pageList,
	})
});

router.get('/user/:id', async (req, res) => {
	const id = req.params.id
	const oid = new ObjectId(id)

	const result = await db.selectUserAndHistory(oid)

	let labelsData = []
	let scoreData = []
	let resData = []

	for (i = 0; i < result[0].history.length; i++) {
		let dateArray = result[0].history[i].createdAt
		labelsData.push(dateArray)
	}

	for (i = 0; i < result[0].history.length; i++) {
		let scoreArray = result[0].history[i].totalScore
		scoreData.push(scoreArray)
	}

	for (i = 0; i < result[0].history.length; i++) {
		for (j = 0; j < result[0].history[i].sections.length; j++) {
			if (result[0].history.length == 1) {
				let resArray = result[0].history[0].sections[j].avgReactionTimeMs
				resData.push(resArray / 1000)
			}
			else {
				let resArray = result[0].history[i].sections[j].avgReactionTimeMs
				resData.push(parseFloat(resArray / 1000))
			}
		}
	}

	let reactionTimeData = [];
	let temp = [];

	for (let i = 0; i < result[0].history.length; i++) {
		for (let j = 0; j < 3; j++) {
			temp.push(resData[0]);
			resData.shift();
		}
		let sum = temp.reduce((a, b) => a + b, 0);
		temp = [];
		reactionTimeData.push((sum / 3).toFixed(2));
	}

	res.render('user/user', {
		result,
		users: true,
		labelsData,
		scoreData,
		reactionTimeData
	})
});

router.get('/histories/:page', async (req, res) => {
	var pageList = []
	const resultsPerPage = 10;
	let page = req.params.page >= 1 ? req.params.page : 1;

	page = page - 1

	db.historiesCount((err, result) => { })
	const result = await db.selectAllUsersAndHistories(page, resultsPerPage)

	for (i = 0; i < Math.ceil(result.totalHistories / resultsPerPage); i++) {
		pageList.push(i + 1)
	}

	res.render('history/allHistory', {
		result,
		history: true,
		pageList,
	})
});

router.get('/history/:id', async (req, res) => {
	const id = req.params.id
	const oid = new ObjectId(id)

	const result = await db.selectHistoryAndUser(oid)
	uid = result[0].user[0]._id

	let hisResult = []
	const userResult = await db.selectUserAndHistory(uid)
	
	for (i = 0; i < userResult[0].history.length; i++) {
		var hid = userResult[0].history[i]._id
		if (JSON.stringify(hid) !== JSON.stringify(oid)) {
			hisResult.push(userResult[0].history[i])
		}
	}

	let con1 = (result[0].sections[0].score.congruent)
	let con2 = (result[0].sections[1].score.congruent)
	let con3 = (result[0].sections[2].score.congruent)
	let incon1 = (result[0].sections[0].score.incongruent)
	let incon2 = (result[0].sections[1].score.incongruent)
	let incon3 = (result[0].sections[2].score.incongruent)
	let con = con1 + con2 + con3
	let incon = incon1 + incon2 + incon3

	let correctStack = []
	let testDayStack = []

	for (i = 0; i < result[0].badge.length; i++) {
		if (result[0].badge[i].type == 'correctStack') {
			correctStack.push(result[0].badge[i])
		}
		if (result[0].badge[i].type == 'testDayStack') {
			testDayStack.push(result[0].badge[i])
		}
	}

	res.render('history/history', {
		result,
		history: true,
		con,
		incon,
		correctStack,
		testDayStack,
		hisResult
	})
});

router.get('/export-json/:database', (req, res) => {
	const database = req.params.database

	if (database == 'users') {
		db.exportAllUsers((err, result) => {
			try {
				fs.writeFileSync('export/users.json', JSON.stringify(result));
				console.log(`Done writing ${database}.json to file.`);
			}
			catch (err) {
				console.log('Error writing to file', err)
			}
			res.redirect('/users/1')
		})
	}
	else if (database == 'histories') {
		db.exportAllHistories((err, result) => {
			try {
				fs.writeFileSync('export/histories.json', JSON.stringify(result));
				console.log(`Done writing ${database}.json to file.`);
			}
			catch (err) {
				console.log('Error writing to file', err)
			}
			res.redirect('/histories/1')
		})
	}
})

router.get('/export-csv/:database', (req, res) => {
	const database = req.params.database

	if (database == 'users') {
		db.exportAllUsers((err, result) => {
			try {
				converter.json2csv(result, (err, csv) => {
					fs.writeFileSync('export/users.csv', csv)
				})
				console.log(`Done writing ${database}.csv to file.`);
			}
			catch (err) {
				console.log('Error writing to file', err)
			}
			res.redirect('/users/1')
		})
	}
	else if (database == 'histories') {
		db.exportAllHistories((err, result) => {
			try {
				converter.json2csv(result, (err, csv) => {
					fs.writeFileSync('export/histories.csv', csv)
				})
				console.log(`Done writing ${database}.csv to file.`);
			}
			catch (err) {
				console.log('Error writing to file', err)
			}
			res.redirect('/histories/1')
		})
	}
})

module.exports = router;