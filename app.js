const compression = require('compression'),
	express = require('express'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	path = require('path'),
	app = express();

const routes = require('./routes/routes');

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(favicon(path.join(__dirname, '/public', '/images', '/favicon.ico'))); //Serve favicon
app.set('view engine', 'ejs');
app.use('/', routes);

let PORT = process.env.PORT || 6060;

app.listen(PORT, () => {
	console.log(`running on ${PORT}`);
});
