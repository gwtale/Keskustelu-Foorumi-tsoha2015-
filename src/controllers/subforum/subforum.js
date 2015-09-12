var Q = require('q');
module.exports = {
	name: 'subforum',
	pathPrefix: 'f',
	init: function() {
		this.get(':id', this.index);
		this.get(':id/create/thread', this.createThread);
	},

	index: function(req, res) {
		var self = this;
		Q.all([
			this.app.models.Subforum.getList({ parent: req.params.id }),
			this.app.models.Thread.getList({ parent: req.params.id })
		]).then(function(data) {
			var forums = data[0];
			var threads = data[1];
			self.render(res, 'subforum_index', { subforum_id: req.params.id, forums: forums , threads: threads});
		});
	},

	createThread: function(req, res) {
		this.render(res, 'subforum_create_thread', { subforum_id: req.params.id });
	}
};