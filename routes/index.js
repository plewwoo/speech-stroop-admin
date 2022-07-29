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

router.get('/users', (req, res) => {
	db.selectAllUsers((err, result) => {
		res.render('user/allUsers', {
			result,
			users: true,
		})
	})
});

router.get('/history', (req, res) => {
	db.selectUserAndHistories((err, result) => {
		res.render('history/allHistory', {
			result,
			history: true,
		})
	})
});

module.exports = router;