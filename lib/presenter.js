window.onload = function()
{
	var scriptPath = document.getElementById('presenter-loader').src.replace(/\/[^\/]*$/, '/');

	var mdScript = document.createElement('script');
	mdScript.type = 'text/javascript';
	mdScript.src = scriptPath + 'markdown-it.js';
	mdScript.onload = function()
	{
		console.log(marked);
	}
	document.head.appendChild(mdScript);
}
