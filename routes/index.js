const express = require('express');
const router = express.Router();
const db = require('../models/controller')
const fs = require('fs');
const converter = require('json-2-csv');

router.get('/', async (req, res) => {
	var userCount
	var historiesCount
	db.usersCount( async (err, result) => {
		userCount = result
		return await userCount
	})
	db.historiesCount( async (err, result) => {
		historiesCount = result
		return await historiesCount
	})
	db.select10UsersAndHistories((err, result) => {
		res.render('index', {
			result,
			userCount,
			historiesCount,
			index: true,
		})
	})
});

router.get('/users/:page', async (req, res) => {
	var pageList = []
	const resultsPerPage = 10;
    let page = req.params.page >= 1 ? req.params.page : 1;

    page = page - 1

	var currentPage = page + 1

	db.usersCount((err, result) => {})

	db.selectAllUsers(page, resultsPerPage, async (err, result) => {
		for (i=0; i < Math.ceil(result.totalUsers / resultsPerPage); i++) {
			pageList.push(i+1)
		}

		await res.render('user/allUser', {
			result,
			users: true,
			pageList,
			currentPage
		})
	})
});

router.get('/user/:id', (req, res) => {
	var ObjectId = require('mongodb').ObjectId;
	const id = req.params.id
	const oid = new ObjectId(id)

	db.selectUserAndHistory(oid, (err, result) => {
		res.render('user/user', {
			result,
			users: true,
		})
	})
});

router.get('/histories/:page', (req, res) => {
	var pageList = []
	const resultsPerPage = 10;
    let page = req.params.page >= 1 ? req.params.page : 1;

    page = page - 1

	db.historiesCount((err, result) => {})

	db.selectAllUsersAndHistories(page, resultsPerPage, (err, result) => {
		for (i=0; i < Math.ceil(result.totalHistories / resultsPerPage); i++) {
			pageList.push(i+1)
		}

		res.render('history/allHistory', {
			result,
			history: true,
			pageList,
			currentPage: true
		})
	})
});

router.get('/history/:id', (req, res) => {
	var ObjectId = require('mongodb').ObjectId;
	const id = req.params.id
	const oid = new ObjectId(id)

	db.selectHistoryAndUser(oid, (err, result) => {

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

		for(i=0; i<result[0].badge.length; i++) {
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
			testDayStack
		})
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
			catch(err) {
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
			catch(err) {
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
			catch(err) {
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
			catch(err) {
				console.log('Error writing to file', err)
			}
			res.redirect('/histories/1')
		})
	}
})

module.exports = router;