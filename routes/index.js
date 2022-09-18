const bcrypt = require('bcrypt')
const express = require('express');
const router = express.Router();
const db = require('../models/controller')
const fs = require('fs');
const converter = require('json-2-csv');
const ObjectId = require('mongodb').ObjectId;

router.get('/login', (req, res) => {
	res.render('auth/login', {
		register: true
	})
})

router.post('/login', async (req, res) => {
	const username = req.body.username // admin
	const password = req.body.password // theplew1531

	const result = await db.checkAdmin(username)

	if (result) {
		if (result.role == 'admin') {
			if (await bcrypt.compare(password, result.password)) {
				req.session.loggedin = true
				req.session.username = username
				res.redirect('/')
			}
			else {
				res.render('auth/login', { msg: 'รหัสผ่านไม่ถูกต้อง', register: true})
			}
		}
		else {
			res.render('auth/login', { msg: 'คุณไม่ได้รับอนุญาต', register: true})
		}
	}
	else {
		res.render('auth/login', { msg: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', register: true})
	}
});

router.get('/logout', function (req, res) {
	req.session.destroy();
	res.redirect('/login');
});

router.get('/', async (req, res) => {
	if (req.session.loggedin) {
		let username = req.session.username
		let userCount
		let historiesCount
		let labelsData1 = [];
		let labelsData2 = []
		let chartData1 = []
		let chartData2 = []

		userCount = await db.usersCount()
		historiesCount = await db.historiesCount()

		let userResult = await db.allUsers()
		let monthArr1 = []
		for (i = 0; i < userResult.length; i++) {
			let dateArray = userResult[i].createdAt
			let month = JSON.stringify(dateArray).split('-')
			monthArr1.push(month[1])
		}

		labelsData1 = monthArr1.filter((item, pos) => {
			return monthArr1.indexOf(item) == pos
		})

		let arr1 = monthArr1
		let count1 = {}

		arr1.forEach(element => {
			count1[element] = (count1[element] || 0) + 1
		})

		chartData1 = Object.values(count1)

		let hisResult = await db.allHistories()
		let monthArr2 = []
		for (i = 0; i < hisResult.length; i++) {
			let dateArray = hisResult[i].createdAt
			let month = JSON.stringify(dateArray).split('-')
			monthArr2.push(month[1])
		}

		labelsData2 = monthArr2.filter((item, pos) => {
			return monthArr2.indexOf(item) == pos;
		});

		let arr2 = monthArr2;
		let count2 = {};

		arr2.forEach(element => {
			count2[element] = (count2[element] || 0) + 1;
		});

		chartData2 = Object.values(count2)

		const result = await db.select10UsersAndHistories()

		context = {
			username,
			result,
			userCount,
			historiesCount,
			index: true,
			labelsData1,
			labelsData2,
			chartData1,
			chartData2,
		}

		res.render('index', context)
	}
	else {
		return res.redirect('/login')
	}
});

router.get('/users/:page', async (req, res) => {
	if (req.session.loggedin) {
		let username = req.session.username
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
			username,
			result,
			users: true,
			pageList,
		})
	}
	else {
		return res.redirect('/login')
	}
});

router.get('/user/:id', async (req, res) => {
	if (req.session.loggedin) {
		let username = req.session.username
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
			username,
			result,
			users: true,
			labelsData,
			scoreData,
			reactionTimeData
		})
	}
	else {
		return res.redirect('/login')
	}
});

router.get('/histories/:page', async (req, res) => {
	if (req.session.loggedin) {
		let username = req.session.username
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
			username,
			result,
			history: true,
			pageList,
		})
	}
	else {
		return res.redirect('/login')
	}
});

router.get('/history/:id', async (req, res) => {
	if (req.session.loggedin) {
		let username = req.session.username
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
			username,
			result,
			history: true,
			con,
			incon,
			correctStack,
			testDayStack,
			hisResult
		})
	}
	else {
		return res.redirect('/login')
	}
});

router.get('/export-json/:database', (req, res) => {
	if (req.session.loggedin) {
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
	}
	else {
		return res.redirect('/login')
	}
})

router.get('/export-csv/:database', (req, res) => {
	if (req.session.loggedin) {
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
	}
	else {
		return res.redirect('/login')
	}
})

module.exports = router;