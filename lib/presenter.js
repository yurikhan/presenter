window.onload = function()
{
	/// Return true if node is a slide separator.
	function isSeparator(node) {
		return node instanceof HTMLHRElement;
	}

	/// Pop the first child from a source element.
	/// If the source has no children
	/// or the child is a separator, return null.
	/// Otherwise, return the child.
	function popNode(source) {
		var node = source.firstChild;
		if (!node) return null;
		source.removeChild(node);
		return isSeparator(node) ? null : node;
	}

	/// Create a slide from initial children of source.
	///
	/// A slide has the structure:
	///
	/// <section class="slide" id="s{n}">
	///   <div class="content">
	///     {content}
	///   </div>
	/// </section>
	///
	/// where children of `source` are moved to {content}
	/// until a <hr> is encountered. The <hr> is discarded.
	///
	/// Return the top-level <section> element.
	///
	function createSlide(n, source) {
		var slide = document.createElement('section');
		slide.id = 's' + n;
		slide.classList.add('slide')
		var content = document.createElement('div');
		content.classList.add('content');
		slide.appendChild(content);

		for (var node; node = popNode(source);) {
			content.appendChild(node);
		}
		return slide;
	}

	var scriptPath = document.getElementById('presenter-loader').src.replace(/\/[^\/]*$/, '/');

	var mdScript = document.createElement('script');
	mdScript.type = 'text/javascript';
	mdScript.src = scriptPath + 'markdown-it.js';
	mdScript.onload = function()
	{
		var md = markdownit({html: true, linkify: true});
		md.linkify.set({fuzzyLink: false});

		var markdown = document.getElementById('markdown');
		var markedup = document.createElement('div');
		markedup.innerHTML = md.render(markdown.textContent);
		var slides = document.createElement('main');
		slides.id = 'slides';

		for (var slideNumber = 1; markedup.firstChild;)
		{
			var slide = createSlide(slideNumber++, markedup);
			slides.appendChild(slide);
		}
		markdown.parentNode.replaceChild(slides, markdown);
	}
	document.head.appendChild(mdScript);
}
