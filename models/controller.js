const conn = require('../database/database')

const db = {
	userCount: (cb) => {
		conn.collection('users').count({}, (err, result) => {
			if (err)
				cb(err, null)
			cb(null, result)
		})
	},
	historiesCount: (cb) => {
		conn.collection('histories').count({}, (err, result) => {
			if (err)
				cb(err, null)
			cb(null, result)
		})
	},
	selectAllUsers: (cb) => {
		conn.collection('users').find({}).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectAllHistories: (cb) => {
		conn.collection('histories').find({}).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectUsers: (cb) => {
		conn.collection('users').findOne({}, (err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectHistories: (cb) => {
		conn.collection('histories').findOne({}, (err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	select10UserAndHistories: (cb) => {
		conn.collection('histories').aggregate([
			{
				$lookup:
				{
					from: 'users',
					localField: 'userId',
					foreignField: '_id',
					as: 'newObj'
				}
			},
			{
				$match: { 'users': { $ne: [] } }
			},
		]).sort({'createdAt' : -1}).limit(10).toArray(function (err, result) {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectUserAndHistories: (cb) => {
		conn.collection('histories').aggregate([
			{
				$lookup:
				{
					from: 'users',
					localField: 'userId',
					foreignField: '_id',
					as: 'newObj'
				}
			},
			{
				$match: { 'users': { $ne: [] } }
			}
		]).toArray(function (err, result) {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
};

module.exports = db;