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

	/// Return true if node is a paragraph containing a single image.
	function isImage(node) {
		return node instanceof HTMLParagraphElement
			&& node.childNodes.length === 1
			&& node.firstChild instanceof HTMLImageElement;
	}

	/// Return true if content of a slide is empty,
	/// except maybe for a single whitespace-only text node.
	function isEmpty(content) {
		return !content.firstChild
			|| (content.childNodes.length === 1
				&& content.firstChild.nodeType === Node.TEXT_NODE
				&& content.firstChild.nodeValue.trim() === '')
	}

	/// Add node to content of a slide.
	/// Perform any transformations if needed.
	function addNode(slide, content, node) {
		if (isImage(node) && isEmpty(content))
		{
			var img = node.firstChild;
			slide.classList.add('image');
			slide.style.backgroundImage = 'url(' + img.src + ')';
			img.alt.
				split(/\s+/).
				filter(function(s) { return s !== ''; }).
				forEach(function(s) { slide.classList.add(s); });
			return;
		}
		content.appendChild(node);
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
			addNode(slide, content, node);
		}
		return slide;
	}

	function previousSlide(event, slides, thisSlide)
	{
		window.location.replace('#' + (thisSlide.previousSibling || thisSlide).id);
		event.preventDefault();
	}
	function nextSlide(event, slides, thisSlide)
	{
		window.location.replace('#' + (thisSlide.nextSibling || thisSlide).id);
		event.preventDefault();
	}
	function firstSlide(event, slides, thisSlide)
	{
		window.location.replace('#' + (slides.firstChild || slides).id);
		event.preventDefault();
	}
	function lastSlide(event, slides, thisSlide)
	{
		window.location.replace('#' + (slides.lastChild || slides).id);
		event.preventDefault();
	}
	function ignore(event, slides, thisSlide) {}

	var SHIFT = 256, CTRL = 512, ALT = 1024, META = 2048,
		BACKSPACE = 8, SPACE = 32,
		PAGEUP = 33, PAGEDOWN = 34, END = 35, HOME = 36,
		LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

	var keyBindings = {};
	keyBindings[BACKSPACE] =
		keyBindings[SHIFT | SPACE] =
		keyBindings[PAGEUP] =
		keyBindings[LEFT] =
		keyBindings[UP] = previousSlide;

	keyBindings[SPACE] =
		keyBindings[PAGEDOWN] =
		keyBindings[RIGHT] =
		keyBindings[DOWN] = nextSlide;

	keyBindings[HOME] =
		keyBindings[CTRL | HOME] = firstSlide;

	keyBindings[END] =
		keyBindings[CTRL | END] = lastSlide;

	var charBindings = {
		'n': nextSlide, 'N': nextSlide,
		'f': nextSlide, 'F': nextSlide,
		'k': nextSlide, 'K': nextSlide,
		'l': nextSlide, 'L': nextSlide,
		'p': previousSlide, 'P': previousSlide,
		'b': previousSlide, 'B': previousSlide,
		'h': previousSlide, 'H': previousSlide,
		'j': previousSlide, 'J': previousSlide,
		'a': firstSlide, 'A': firstSlide,
		'^': firstSlide, 'g': firstSlide,
		'e': lastSlide, 'E': lastSlide,
		'$': lastSlide, 'G': lastSlide
	};

	function onKeyDown(event) {
		var keyCode = event.keyCode |
			(event.metaKey ? META : 0) |
			(event.altKey ? ALT : 0) |
			(event.ctrlKey ? CTRL : 0) |
			(event.shiftKey ? SHIFT : 0);
		(keyBindings[keyCode] || ignore)(
			event,
			document.getElementById('slides'),
			document.getElementById(window.location.hash.replace(/^#/, '')));
	}

	function onKeyPress(event) {
		var charCode = (event.metaKey ? 'M-' : '') +
			(event.altKey ? 'A-' : '') +
			(event.ctrlKey ? 'C-' : '') +
			String.fromCharCode(event.charCode);
		(charBindings[charCode] || ignore)(
			event,
			document.getElementById('slides'),
			document.getElementById(window.location.hash.replace(/^#/, '')));
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
		var codeblocks = slides.querySelectorAll('pre code');
		for (var i = 0; i < codeblocks.length; ++i) {
			if (codeblocks[i].classList.length === 0) {
				codeblocks[i].classList.add('nohighlight');
			}
			codeblocks[i].classList.add('hljs');
		}
		markdown.parentNode.replaceChild(slides, markdown);

		window.location.replace(window.location.hash || '#s1');

		window.onkeydown = onKeyDown;
		window.onkeypress = onKeyPress;

		var highlightScript = document.createElement('script');
		highlightScript.type = 'text/javascript';
		highlightScript.src = scriptPath + 'highlight.pack.js';
		highlightScript.onload = function() {
			hljs.initHighlighting();
		}
		document.head.appendChild(highlightScript);
	}
	document.head.appendChild(mdScript);
}
