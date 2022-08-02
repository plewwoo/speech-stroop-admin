const express = require('express');
const { userCount } = require('../models/controller');
const router = express.Router();
const db = require('../models/controller')

router.get('/', async (req, res) => {
	var userCount
	var historiesCount
	db.usersCount((err, result) => {
		userCount = result
		return userCount
	})
	db.historiesCount((err, result) => {
		historiesCount = result
		return historiesCount
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

router.get('/users/:page', (req, res) => {
	var pageList = []
	const resultsPerPage = 10;
    let page = req.params.page >= 1 ? req.params.page : 1;

    page = page - 1

	var currentPage = page + 1

	db.usersCount((err, result) => {})

	db.selectAllUsers(page, resultsPerPage, (err, result) => {
		for (i=0; i < Math.ceil(result.totalUsers / resultsPerPage); i++) {
			pageList.push(i+1)
		}

		res.render('user/allUser', {
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
		let con = con1 + con2 + con3
		let incon1 = (result[0].sections[0].score.incongruent)
		let incon2 = (result[0].sections[1].score.incongruent)
		let incon3 = (result[0].sections[2].score.incongruent)
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

module.exports = router;