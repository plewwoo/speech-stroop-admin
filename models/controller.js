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
	selectUsers: (id, cb) => {
		conn.collection('users').findOne({_id: id}, (err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectHistories: (id, cb) => {
		conn.collection('histories').findOne({_id: id}, (err, result) => {
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
	selectAllUserAndHistories: (cb) => {
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
		]).toArray(function (err, result) {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectUserAndHistories: (id, cb) => {
		console.log('id :', id)
		conn.collection('users').aggregate([
			{
				$match: { '_id': id }
			},
			{
				$lookup:
				{
					from: 'histories',
					localField: '_id',
					foreignField: 'userId',
					as: 'history'
				}
			},
		]).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectHistoriesAndUser: (id, cb) => {
		conn.collection('histories').aggregate([
			{
				$match: { '_id': id }
			},
			{
				$lookup:
				{
					from: 'users',
					localField: 'userId',
					foreignField: '_id',
					as: 'user'
				}
			},
		]).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
};

module.exports = db;