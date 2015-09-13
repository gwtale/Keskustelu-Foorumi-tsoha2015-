var Q = require('q');
module.exports = {
	name: 'user',
	pathPrefix: 'user',
	init: function() {
		this.get(':id', this.getUser);
		this.post(':id/makeAdmin', this.app.auth.require(), this.makeAdmin);
	},

	getUser: function(req, res) {
		var self = this;
		Q.all([this.app.models.Admin.getSubforumsUserIsAdminIn({
			loadById: true,
			username: req.session.username
		}),
		this.app.models.User.get({username: req.params.id})
		]).then(function(data) {
			var subforums = data[0];
			var user = data[1];
			var promises = [];
			var checkIdAdmin = function(index, subforum) {
				promises.push(self.app.models.Admin.isUserAdmin({username: user.username, subforum_id: subforum.id})
					.then(function(isAdmin) {
						console.log("index = " + index + " isAdmin = " + isAdmin)
						if (isAdmin)
							subforums.splice(subforums.indexOf(subforum), 1);
						return Q();
					}));
			}
			for(var i in subforums) {
				checkIdAdmin(i, subforums[i]);
			}
			Q.all(promises).then(function() {
				self.render(req, res, 'user', {adminSubforums: subforums, user: user});
			}).done();
		}, function() {
			res.sendStatus(404);
		}).done();
	},
	makeAdmin: function(req, res) {
		var self = this;
		this.app.models.Admin.makeUserAdmin({
			username: req.params.id,
			subforum_id: req.body.subforum_id
		}).then(function() {
			res.redirect(self.app.config.url_prefix + '/user/' + req.params.id + "?madeAdmin=true");
		}, function(err) {
			self.app.log(err);
			res.redirect(self.app.config.url_prefix + '/user/' + req.params.id + "?error=makeAdmin");
		}).done();
	}
};