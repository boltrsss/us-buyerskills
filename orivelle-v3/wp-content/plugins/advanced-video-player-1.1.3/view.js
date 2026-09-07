(function(){
	function initFigure(figure){
		if (!figure || figure.getAttribute('data-avp') !== '1') return;
		var video = figure.querySelector('video');
		if (!video) return;

		if (!figure.style.position) figure.style.position = 'relative';

		var pad = (figure.getAttribute('data-avp-pad')||'20,40,20,40').split(',');
		var rad = (figure.getAttribute('data-avp-rad')||'0,0,0,0').split(',');
		var bg = figure.getAttribute('data-avp-bg') || 'rgba(0,0,0,0.55)';
		var icon = figure.getAttribute('data-avp-icon') || '#fff';

		var btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'avp-btn';
		btn.setAttribute('aria-label', 'Play');
		btn.style.position = 'absolute';
		btn.style.left = '50%';
		btn.style.top = '50%';
		btn.style.transform = 'translate(-50%, -50%)';
		btn.style.zIndex = '2';
		btn.style.display = 'flex';
		btn.style.alignItems = 'center';
		btn.style.justifyContent = 'center';
		btn.style.cursor = 'pointer';
		btn.style.background = bg;
		btn.style.paddingTop = (parseInt(pad[0],10)||0) + 'px';
		btn.style.paddingRight = (parseInt(pad[1],10)||0) + 'px';
		btn.style.paddingBottom = (parseInt(pad[2],10)||0) + 'px';
		btn.style.paddingLeft = (parseInt(pad[3],10)||0) + 'px';
		btn.style.borderTopLeftRadius = rad[0] || '0';
		btn.style.borderTopRightRadius = rad[1] || '0';
		btn.style.borderBottomRightRadius = rad[2] || '0';
		btn.style.borderBottomLeftRadius = rad[3] || '0';

		var iconEl = document.createElement('span');
		iconEl.className = 'avp-icon';
		iconEl.style.borderLeftColor = icon;
		btn.appendChild(iconEl);
		figure.appendChild(btn);

		var engaged = false;
		function hideBtn(){ btn.style.opacity = '0'; btn.style.pointerEvents = 'none'; }
		function showBtn(){ btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }

		function firstEngage(){
			try { video.currentTime = 0; } catch(e){}
			try { video.muted = false; } catch(e){}
			if (video.paused) { try { var p = video.play(); if (p && p.catch) p.catch(function(){}); } catch(e){} }
			hideBtn();
			engaged = true;
		}
		function toggle(){
			if (!engaged){ firstEngage(); return; }
			if (video.paused){ try{ video.play(); }catch(e){} hideBtn(); }
			else { video.pause(); showBtn(); }
		}

		btn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); toggle(); });
		figure.addEventListener('click', function(e){
			if (e.target === btn || e.target === iconEl) return;
			toggle();
		});

		video.addEventListener('pause', function(){ if (engaged) showBtn(); });
		video.addEventListener('play',  function(){ if (engaged) hideBtn(); });

		showBtn();
	}

	function ready(fn){
		if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 0);
		else document.addEventListener('DOMContentLoaded', fn);
	}
	function initAll(){
		var nodes = document.querySelectorAll('figure.wp-block-video, .wp-block-video');
		for (var i=0;i<nodes.length;i++) initFigure(nodes[i]);
	}
	ready(initAll);
})();