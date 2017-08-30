var express = require('express');
var mysql = require('mysql');
var dbconfig = require('../config/database');
var stringSimilarity = require('string-similarity');

module.exports = function(app, passport) {
	app.get('/', function(req, res) {
		// Save any passed messages, then set the session message to null
		var flashMessage = req.session.message;
		req.session.message = null;

		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		connection.query("SELECT * FROM posts", function(err, rows) {
            if (rows.length) {
				res.render('navbar-items/index.ejs', {
					message: flashMessage,
					posts: rows,
					user: req.user || null
				});
			} else {
				res.render('navbar-items/index.ejs', {
					message: flashMessage,
					posts: rows,
					user: req.user || null
				});
			}
        });
	});

	app.get('/blog', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		connection.query("SELECT * FROM posts",  function(err, rows) {
			var pageSize = 10,
				totalPosts = rows.length,
				pageCount = Math.ceil(totalPosts/pageSize),
				currentPage = 1,
				allPosts = [],
				posts = [],
				postsArrays = [],
				postsList = [];

			// Necessary because of copying issues with objects in Javascript
			for (var i = 0; i < rows.length; i++) {
				allPosts.push(rows[i]);
			}

			posts = rows.reverse();

			// Split the posts into groups
			while (rows.length > 0) {
			    postsArrays.push(posts.splice(0, pageSize));
			}

			// Set current page as variable
		    if (typeof req.query.page !== 'undefined') {
		        currentPage = req.query.page;
		    }

		    // Show list of posts from current page
    		postsList = postsArrays[currentPage - 1];

            if (postsList.length) {
				res.render('navbar-items/blog.ejs', {
					pageSize: pageSize,
			        totalPosts: totalPosts,
			        pageCount: pageCount,
			        currentPage: currentPage,
					message: req.session.message,
					postsPaginate : postsList,
					posts : allPosts,
					user: req.user || null
				});
			} else {
				res.render('navbar-items/blog.ejs', {
					pageSize: pageSize,
			        totalPosts: totalPosts,
			        pageCount: pageCount,
			        currentPage: currentPage,
					message: req.session.message,
					postsPaginate : [],
					posts : allPosts,
					user: req.user || null
				});
			}
			req.session.message = null;
        });
	});

	app.get('/games', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		connection.query("SELECT * FROM games",  function(err, rows) {
            if (rows.length) {
				res.render('navbar-items/games.ejs', {
					message: req.session.message,
					games : rows,
					user: req.user || null
				});
			} else {
				res.render('navbar-items/games.ejs', {
					message: req.session.message,
					games : [],
					user: req.user || null
				});
			}
			req.session.message = null;
        });
	});

	app.get('/apps', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var message = req.session.message;
		req.session.message = null

		connection.query("SELECT * FROM apps",  function(err, rows) {
            if (rows.length) {
				res.render('navbar-items/apps.ejs', {
					message: message,
					apps : rows,
					user: req.user || null
				});
			} else {
				res.render('navbar-items/apps.ejs', {
					message: message,
					apps : [],
					user: req.user || null
				});
			}
			req.session.message = null;
        });
	});

	app.get("/blog/:pageName", function (req, res) {
	    var pageName = req.params.pageName;

		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var flashMessage = req.session.message;
		req.session.message = null;

		var query = connection.query("SELECT * FROM posts WHERE slug = ? ", pageName);

		// In case of an error retrieving the data
		query.on('error', function(err) { 
			console.log('A database error occured:'); 
			console.log(err);
		});

		query.on('result', function(result) {
		  	if (result != null) {
		  		connection.query("SELECT * FROM posts", function(err, rows) {
		  			var posts = rows;
		            if (rows.length) {
		            	connection.query("SELECT * FROM comments WHERE post_id = ?", result.id, function(err, rows) {
							res.render('posts/' + pageName + '/index.ejs', {
								message: flashMessage,
					  			comments: rows,
					  			posts: posts,
					  			post: result,
					  			user: req.user || null
				  			});
						});
					}
				});
			}
		});
	});

	app.get("/games/:pageName", function (req, res) {
	    var pageName = req.params.pageName;

		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var query = connection.query("SELECT * FROM games WHERE slug = ? ", pageName);

		// In case of an error retrieving the data
		query.on('error', function(err) { 
			console.log('A database error occured:'); 
			console.log(err);
		});

		query.on('result', function(result) {
		  	if (result != null) {
		  		res.render('games/' + result.folder_name + '/index.ejs', {
		  			game: result,
		  			user: req.user || null
		  		});
		  	}
		});
	});

	app.get("/apps/:pageName", function (req, res) {
	    var pageName = req.params.pageName;

		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var flashMessage = req.flash.message;
		req.flash.message = null;

		var query = connection.query("SELECT * FROM apps WHERE slug = ? ", pageName);

		// In case of an error retrieving the data
		query.on('error', function(err) { 
			console.log('A database error occured:'); 
			console.log(err);
		});

		query.on('result', function(result) {
		  	if (result != null) {
		  		res.render('apps/' + result.folder_name + '/index.ejs', {
		  			stringSimilarity: stringSimilarity,
		  			message: flashMessage,
		  			app: result,
		  			user: req.user || null
		  		});
		  	}
		});
	});

	// Legit the worst route I've ever coded
	app.post('/search', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var searchText = req.body.search_box
		var flashMessage = req.flash.message;
		req.flash.message = null;

		connection.query("SELECT * FROM posts",  function(err, rows) {
			var allPosts = rows;
            if (rows.length) {
				var tempPosts = []
				var posts = []

				// Why I have to do this I have no freaking clue...it's way harder than necessary
				for (var i = 0; i < allPosts.length; i++) {
					var similarity = stringSimilarity.compareTwoStrings(allPosts[i].title, searchText); 
					if (similarity > 0.1) {
						tempPosts.push(allPosts[i]);
					}
				}

				var titles = []
				for (var i = 0; i < tempPosts.length; i++) {
					titles.push(tempPosts[i].title);
				}
				var allTitles = titles.slice()

				// Sort the posts by similarity - screw this it's stupidly complicated
				// Why the hell would you have slice and splice have two completely different meanings - typos galore and pulling out hair my goodness
				for (var i = 0; i < allTitles.length; i++) {
					var tempTitles = titles.slice()
					if (titles.length > 1) {
						var ratings = stringSimilarity.findBestMatch(searchText, tempTitles.slice(0, titles.length)).ratings
					
						var highestIndex = 0;
						for (var j = 0; j < ratings.length; j++) {
							if (ratings[j].rating > ratings[highestIndex].rating)
								highestIndex = j;
						}
						posts.push(tempPosts[titles.indexOf(ratings[highestIndex].target)]);
						titles.splice(titles.indexOf(ratings[highestIndex].target), 1);
					} else {
						posts.push(tempPosts[allTitles.indexOf(titles[0])]);
					}
				}

				var totalPosts = posts.length,
					pageSize = 10,
					pageCount = Math.ceil(allPosts.length/10),
					currentPage = 1,
					postsArrays = [],
					postsList = [];

				while (posts.length > 0) {
		            postsArrays.push(posts.splice(0, pageSize));
		        }

		        if (typeof req.query.page !== 'undefined') {
		            currentPage = req.query.page;
		        }

		        postsList = postsArrays[currentPage - 1];

				res.render('searchForPosts.ejs', {
					message: flashMessage,
					posts: allPosts,
					foundPosts: postsList,
					pageSize: pageSize,
					totalPosts: totalPosts,
					pageCount: pageCount,
					currentPage: currentPage,
					user: req.user || null
				});
			} else {
				var totalPosts = 0,
					pageSize = 0,
					pageCount = 0,
					currentPage = 1,
					postsArrays = [],
					postsList = [];

				res.render('searchForPosts.ejs', {
					message: flashMessage,
					posts: allPosts,
					foundPosts: postsList,
					pageSize: pageSize,
					totalPosts: totalPosts,
					pageCount: pageCount,
					currentPage: currentPage,
					user: req.user || null
				});
			}
			req.session.message = null;
        });
	})

	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { 
			message: req.flash('loginMessage'),
			user: req.user || null
		});
	});

	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("Login attempt...");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }

        	res.redirect(req.get('referer'));
    	}
    );

	app.get('/post', function(req, res) {
		res.render('createPost.ejs');
	});

	app.post('/post', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var newPost = {
			username: req.user.username,
			title: req.body.title,
			description: req.body.description,
			tags: req.body.tags,
			folder_name: req.body.folder_name,
			slug: req.body.slug,
		};
		
		var insertQuery = "INSERT INTO posts ( username, title, description, tags, folder_name, slug ) values (?,?,?,?,?,?)";

		connection.query(insertQuery, [newPost.username, newPost.title, newPost.description, newPost.tags, newPost.folder_name, newPost.slug]);

		req.session.message = 'Post successfully created';
		res.redirect('/');
	});

	app.get('/newGame', function(req, res) {
		res.render('createGame.ejs');
	});

	app.post('/newGame', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var newGame = {
			username: req.user.username,
			title: req.body.title,
			description: req.body.description,
			folder_name: req.body.folder_name,
			slug: req.body.slug
		};
		
		var insertQuery = "INSERT INTO games ( username, title, description, folder_name, slug ) values (?,?,?,?,?)";

		connection.query(insertQuery, [newGame.username, newGame.title, newGame.description, newGame.folder_name, newGame.slug]);

		req.session.message = 'Game successfully created';
		res.redirect('/');
	});

	app.get('/newApp', function(req, res) {
		res.render('createApp.ejs');
	});

	app.post('/newApp', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var newApp = {
			username: req.user.username,
			title: req.body.title,
			description: req.body.description,
			folder_name: req.body.folder_name,
			slug: req.body.slug
		}

		var insertQuery = "INSERT INTO apps ( username, title, description, folder_name, slug ) values (?,?,?,?,?)";
		connection.query(insertQuery, [newApp.username, newApp.title, newApp.description, newApp.folder_name, newApp.slug]);

		req.session.message = 'App successfully created';
		res.redirect('/');
	});

	app.post('/comment', function(req, res) {
		if (req.user) { // Ensure that a user is logged in
			var connection = mysql.createConnection(dbconfig.connection);
			connection.query('USE ' + dbconfig.database);
			var newComment = {
				username: req.user.username,
				post_id: req.body.post_id,
				parent_comment_id: req.body.parent_id,
				content: req.body.content
			}

			var insertQuery = "INSERT INTO comments ( post_id, parent_comment_id, username, content) values (?,?,?,?)";
			connection.query(insertQuery, [newComment.post_id, newComment.parent_comment_id, newComment.username, newComment.content]);
			
			req.session.message = 'Comment successfully created';
			res.redirect(req.get('referer'));
		} else {
			req.session.message = 'Error! You must login to leave a comment';
			res.redirect('/');
		}
		
	});

	app.post('/delete', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var slug = req.body.slug

		connection.query("delete from posts where slug = ?", slug, function(err, rows) {
			req.session.message = 'Post successfully deleted';
			res.redirect('/blog')
		});		
	});

	app.post('/deleteGame', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var slug = req.body.slug
		
		connection.query("delete from games where slug = ?", slug, function(err, rows) {
			req.session.message = 'Game successfully deleted';
			res.redirect('/games')
		});		
	});

	app.post('/deleteApp', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var slug = req.body.slug
		
		connection.query("delete from apps where slug = ?", slug, function(err, rows) {
			req.session.message = 'App successfully deleted';
			res.redirect('/apps')
		});		
	});

	app.post('/deleteComment', function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		var comment_id = req.body.comment_id
		
		connection.query("delete from comments where id = ?", comment_id, function(err, rows) {
			req.session.message = 'Comment successfully deleted';
			res.redirect(req.get('referer'))
		});
	});

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { 
			message: req.flash('signupMessage'),
			user: req.user || null 
		});
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/profile', isLoggedIn, function(req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		connection.query('USE ' + dbconfig.database);

		connection.query("SELECT * FROM posts WHERE username = ?",[req.user.username], function(err, rows) {
            if (rows.length) {
				res.render('profile.ejs', {
					// Get the user out of the session and pass it to the template
					user : req.user,
					message : req.session.message,
					posts : rows,
				});
			} else {
				res.render('profile.ejs', {
					// Get the user out of the session and pass it to the template
					user : req.user,
					message : req.session.message,
					posts : [],
				});
			}
        });
        if (req.session.message) {
        	req.session.message = null;
        }
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
}

function isLoggedIn(req, res, next) {
	// If user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// If they aren't redirect them to the home page
	req.session.message = "Sorry, but you must log in";
	res.redirect('/');
}