const conn = require('../database/database')

let users = 0
let histories = 0

const db = {
	checkAdmin: async (username, cb) => {
		return new Promise((resolve, reject) => {
			conn.collection('users').findOne({'username': username}, (err, result) => {
				resolve(result)
			})
		})
	},
	usersCount: async (cb) => {
		return new Promise((resolve, reject) => {
			conn.collection('users').count({}, (err, result) => {
				resolve(result)
	
				users = result;
				return users;
			})
		})
	},
	historiesCount: async (cb) => {
		return new Promise((resolve, reject) => {
			conn.collection('histories').count({}, (err, result) => {
				resolve(result)
	
				histories = result
				return histories
			})
		})
	},
	selectAllUsers: async (page, resultsPerPage, cb) => {
		return new Promise((resolve, reject) => {
			conn.collection('users').find({}).limit(resultsPerPage).skip(page > 0 ? page * resultsPerPage : 0).sort({ 'createdAt': -1 }).toArray((err, result) => {
				resolve({
					'totalUsers': users,
					'page': page,
					'pagination': page + 1,
					'users': result
				})
			});
		})
	},
	select10UsersAndHistories: async (cb) => {
		return new Promise((resolve, reject) => {
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
				resolve(result)
			});
		})
	},
	selectAllUsersAndHistories: async (page, resultsPerPage, cb) => {
		return new Promise((resolve, reject) => {
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
				resolve({
					'totalHistories': histories,
					'page': page,
					'pagination': page + 1,
					'histories': result
				})
			});	
		})
	},
	selectUserAndHistory: async (id, cb) => {
		return new Promise((resolve, reject) => {
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
				resolve(result)
			});
		})
	},
	selectHistoryAndUser: async (id, cb) => {
		return new Promise((resolve, reject) => {
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
				resolve(result)
			});
		})
	},
	allUsers: async (cb) => {
		return new Promise((resolve, reject) => {
			conn.collection('users').find({}).toArray(function (err, result) {
				resolve(result)
			})
		})
	},
	allHistories: async (cb) => {
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