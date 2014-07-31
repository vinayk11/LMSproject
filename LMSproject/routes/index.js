
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.ejs');
};
exports.addEmployee = function(req, res,next) {
	res.render('index.ejs');
};

