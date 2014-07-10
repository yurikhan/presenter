window.onload = function()
{
	var scriptPath = document.getElementById('presenter-loader').src.replace(/\/[^\/]*$/, '/');

	var mdScript = document.createElement('script');
	mdScript.type = 'text/javascript';
	mdScript.src = scriptPath + 'markdown-it.js';
	mdScript.onload = function()
	{
		var md = markdownit({html: true, linkify: true});
		md.linkify.set({fuzzyLink: false});

		var markdown = document.getElementById('markdown');
		var slides = document.createElement('main');
		slides.id = 'slides';
		slides.innerHTML = md.render(markdown.textContent);
		markdown.parentNode.replaceChild(slides, markdown);
	}
	document.head.appendChild(mdScript);
}
