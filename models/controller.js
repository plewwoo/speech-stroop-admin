const conn = require('../database/database')

let users = 0
let histories = 0

const db = {
	usersCount: async (cb) => {
		conn.collection('users').count({}, (err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);

			users = result;
			return users;
		})
	},
	historiesCount: async (cb) => {
		conn.collection('histories').count({}, (err, result) => {
			if (err)
				cb(err, null)
			cb(null, result)

			histories = result
			return histories
		})
	},
	selectAllUsers: async (page, resultsPerPage, cb) => {
		conn.collection('users').find({}).limit(resultsPerPage).skip(page > 0 ? page * resultsPerPage : 0).sort({ 'createdAt': -1 }).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, {
				'totalUsers': users,
				'page': page,
				'pagination': page + 1,
				'users': result
			});
		});
	},
	selectUser: (id, cb) => {
		conn.collection('users').findOne({ _id: id }, (err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	select10UsersAndHistories: async (cb) => {
		conn.collection('histories').aggregate([
			{
				$lookup:
				{
					from: 'users',
					localField: 'userId',
					foreignField: '_id',
					as: 'user'
				}
			},
			{
				$match: { 'users': { $ne: [] } }
			},
		]).sort({ 'createdAt': -1 }).limit(10).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectAllUsersAndHistories: (page, resultsPerPage, cb) => {
		conn.collection('histories').aggregate([
			{
				$lookup:
				{
					from: 'users',
					localField: 'userId',
					foreignField: '_id',
					as: 'user'
				}
			},
			{
				$match: { 'users': { $ne: [] } }
			},
			{
				$sort: { 'createdAt': -1 }
			},
			{
				$skip: page > 0 ? page * resultsPerPage : 0
			},
			{
				$limit: resultsPerPage
			},
		]).toArray(function (err, result) {
			if (err)
				cb(err, null);
			cb(null, {
				'totalHistories': histories,
				'page': page,
				'pagination': page + 1,
				'histories': result
			});
		});
	},
	selectUserAndHistory: (id, cb) => {
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
			{
				$lookup:
				{
					from: 'badges',
					localField: 'badge',
					foreignField: '_id',
					as: 'badge'
				}
			},
		]).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	selectHistoryAndUser: (id, cb) => {
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
			{
				$lookup:
				{
					from: 'badges',
					localField: 'badge',
					foreignField: '_id',
					as: 'badge'
				}
			},
		]).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	allUsers: (cb) => {
		return new Promise((resolve, reject) => {
			conn.collection('users').find({}).toArray(function (err, result) {
				resolve(result)
			})
		})
	},
	allHistories: (cb) => {
		return new Promise((resolve, reject) => {
			conn.collection('histories').find({}).toArray(function (err, result) {
				resolve(result)
			})
		})
	},
	exportAllUsers: (cb) => {
		conn.collection('users').find({}).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
	exportAllHistories: (cb) => {
		conn.collection('histories').find({}).toArray((err, result) => {
			if (err)
				cb(err, null);
			cb(null, result);
		});
	},
};

module.exports = db;