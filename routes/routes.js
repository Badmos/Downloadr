const express = require('express'),
	axios = require('axios'),
	youtubeDl = require('youtube-dl'),
	router = express.Router();

router.route('/').get((req, res) => {
	res.render('index', {
		title: 'Downloadr: Download YouTube Videos in a click'
	});
});

router
	.route('/download')
	.get((req, res) => {
		res.redirect('/');
	})
	.post((req, res, next) => {
		let videoUrl = req.body.url,
			fileFormats = [],
			//see if our url matches this generic youtube pattern
			pattern = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
		axios
			.get(videoUrl)
			.then(response => {
				//does url match acceptable pattern
				if (pattern.test(videoUrl)) {
					//ignore DASH manifests and similar data from video
					youtubeDl.getInfo(
						videoUrl,
						['--youtube-skip-dash-manifest'],
						(err, info) => {
							if (err) {
								console.log(err);
								return res.render('videos', {
									error:
										'Invalid or unacceptable link. Kindly paste the correct Link to the YouTube Video'
								});
							}
							// add format to array. Do not include audio
							info.formats.forEach(item => {
								if (
									item.format_note !== 'DASH audio' &&
									item.filesize
								) {
									item.filesize = item.filesize
										? byteToDiskSpace(item.filesize)
										: 'File is too Large';
									fileFormats.push(item);
								}
							});
							res.render('videos', {
								error: err,
								meta: { id: info.id, fileFormats }
							});
						}
					);
				} else {
					res.render('videos', {
						error:
							'Invalid or unacceptable link. Kindly paste the correct Link to the YouTube Video'
					});
				}
			})
			.catch(err => {
				res.render('videos', {
					error:
						'Axios could not get link. Check your internet connection.'
				});
			});
	});

router.route('*').get((req, res) => {
	res.render('404');
});

function byteToDiskSpace(sizeInBytes) {
	let digitalStorageRange = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	//TeraByte is the max downloadable and it is of order 10^14.
	//check if video size is greater than the highest possible terabyte value in our case
	if (sizeInBytes > 9.99999999999999e14)
		return 'Video size is too large. Download a video less than 909TB';
	else if (sizeInBytes === 0) return '0 Byte';
	else {
		// Logic behind this is:::: Log Y base X = Log Y / Log X = a number Z for which X is raised to give Y.
		// We need a number for which if we raise 1024 bytes, we get the input byte size
		let order = Number(Math.floor(Math.log(sizeInBytes) / Math.log(1024)));
		let digitalStorage = digitalStorageRange[order];
		let sizeOnDisk = (sizeInBytes / Math.pow(1024, order)).toFixed(1);
		return `${sizeOnDisk} ${digitalStorage}`;
	}
}

module.exports = router;
