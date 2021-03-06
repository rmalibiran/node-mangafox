var $ = new require('./jquack.js');

var MANGAFOX_BASE_URL = 'http://fanfox.net';

var mangaFox = {};

//Gets info about a manga
mangaFox.getDetails = function(id, callback){
	$.post(MANGAFOX_BASE_URL + '/ajax/series.php', {sid:id}, function(data){
		
		try{data = JSON.parse(data);}catch(e){};
		
		(callback||function(){})(data);
		
		
		
	});
}

//Gets all available manga titles
mangaFox.getManga = function(callback){
	$.get(MANGAFOX_BASE_URL + '/manga/',function(data){
		var list = [];
		
		data.find('.manga_list li a').each(function(index, d){
			var b = $(d);
			var mng = {
				_id: mangaFox.fixTitle(b.text()),
				id:b.attr('rel'), 
				title:b.text()
			};
			list.push(mng);
		});
		
		(callback||function(){})(list);
	}, true);
}

//Get the number of pages in a chapter
mangaFox.getPages = function(manga, ch, callback){
	$.get(MANGAFOX_BASE_URL + '/manga/'+mangaFox.fixTitle(manga)+'/c'+mangaFox.pad(ch,3)+'/1.html', function(d){
		callback((d.find('.l option').length-2)/2);
	}, true);
};

//Get the urls for page images
mangaFox.getImages = function(manga, ch, callback){
	mangaFox.getPages(manga, ch, function(num){
		var data = [];
		
		var temp = function(n){
			$.get(MANGAFOX_BASE_URL + '/manga/'+mangaFox.fixTitle(manga)+'/v01/c'+mangaFox.pad(ch,3)+'/'+n+'.html', function(d){
				data.unshift(d.find('#viewer img').attr('src'))
				if(n>1){
					temp(n-1);
				}
				else{
					(callback||function(){})(data);
				}
			}, true);
		};
		
		temp(num);

	});

};

//Gets the image url for a specified manga, chapter, and page
mangaFox.getPageImage = function(manga, ch, page, callback){
	$.get(MANGAFOX_BASE_URL + '/manga/'+mangaFox.fixTitle(manga)+'/v01/c'+mangaFox.pad(ch,3)+'/'+page+'.html', function(d){
		var imgUrl = d.find('#viewer img').attr('src');
			(callback||function(){})(imgUrl);
	}, true);
}

mangaFox.getChapters = function(manga, callback){
	$.get(MANGAFOX_BASE_URL + '/manga/'+mangaFox.fixTitle(manga), function(d){
		var list = {};
		$(d.find('.chlist .tips')).each(function(i,e) {
			var b = $(e);
			list[b.text()] = {id:b.attr('href'), title:b.text()};
		});
		console.log( list );
		callback($(d.find('.chlist .tips')[0]).text().replace(/\D/g,''));
	}, true);
};

//Gets the number of latest chapter
mangaFox.getLatestChapter = function(manga, callback){
	$.get(MANGAFOX_BASE_URL + '/manga/'+mangaFox.fixTitle(manga), function(d){
		callback($(d.find('.chlist .tips')[0]).text().replace(/\D/g,''));
	}, true);
};

//get the list of currently popular manga
mangaFox.getPopular = function(callback){
	$.get(MANGAFOX_BASE_URL + '/', function(d){
		var list = {};
		d.find('#popular li div.nowrap a').each(function(i,e){
			var b = $(e);
			list[b.text()] = {id:b.attr('rel'), title:b.text()};
		});
		callback(list);
	}, true);
};

//get the list of currently popular manga
mangaFox.getLatest = function(callback){
	$.get(MANGAFOX_BASE_URL + '/', function(d){
		var list = {};
		d.find('#new li div.nowrap a').each(function(i,e){
			var b = $(e);
			list[b.text()] = {id:b.attr('rel'), title:b.text()};
		});
		callback(list);
	}, true);
};

//makes all titles conform to the title conventions
mangaFox.fixTitle = function(title){
	var t = title.replace(/[^a-zA-Z\d\s-]/g, '_');
	t = t.replace(/\ /g, '_');
	t = t.replace(/\-/g, '_').toLowerCase();
	t = t.replace(/\___/g,'_');
	t = t.replace(/\__/g,'_');
	if(t.substr(t.length-1) == '_'){
		t = t.substr(0, t.length-1);
	}

	if(t.substr(0, 1) == '_'){
		t = t.substr(1);
	}	
	return t;
};

//pads single digit numbers to ther xxx equivalent
mangaFox.pad  = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

module.exports = mangaFox;
