const express = require('express');
const router = express.Router();
const db = require('../models/controller')

router.get('/', async (req, res) => {
	var userCount
	var historiesCount
	db.userCount((err, result) => {
		userCount = result
		return userCount
	})
	db.historiesCount((err, result) => {
		historiesCount = result
		return historiesCount
	})
	db.select10UserAndHistories((err, result) => {
		res.render('index', {
			result,
			userCount,
			historiesCount,
			index: true,
		})
	})
});

router.get('/user', (req, res) => {
	db.selectAllUsers((err, result) => {
		res.render('user/allUser', {
			result,
			users: true,
		})
	})
});

router.get('/user/:id', (req, res) => {
	var ObjectId = require('mongodb').ObjectId;
	const id = req.params.id
	const oid = new ObjectId(id)

	db.selectUserAndHistories(oid, (err, result) => {
		res.render('user/user', {
			result,
			users: true,
		})
	})
});

router.get('/history', (req, res) => {
	db.selectAllUserAndHistories((err, result) => {
		res.render('history/allHistory', {
			result,
			history: true,
		})
	})
});

router.get('/history/:id', (req, res) => {
	var ObjectId = require('mongodb').ObjectId; 
	const id = req.params.id
	const oid = new ObjectId(id)

	db.selectHistoriesAndUser(oid, (err, result) => {

		let con1 = (result[0].sections[0].score.congruent)
		let con2 = (result[0].sections[1].score.congruent)
		let con3 = (result[0].sections[2].score.congruent)
		let con = con1 + con2 + con3
		let incon1 = (result[0].sections[0].score.incongruent)
		let incon2 = (result[0].sections[1].score.incongruent)
		let incon3 = (result[0].sections[2].score.incongruent)
		let incon = incon1 + incon2 + incon3

		res.render('history/history', {
			result,
			history: true,
			con,
			incon
		})
	})
});

module.exports = router;