import { communication } from '../communication';
import { geoData } from '../geoData';
import { global } from '../global';
import { lists } from '../lists';
import { formFunc, ui } from '../ui';
import { user } from '../user';
import { pageContact } from './contact';
import { pageEvent } from './event';
import { pageLocation } from './location';

export { pageSearch };

class pageSearch {
	static map = {
		canvas: null,
		id: null,
		loadActive: false,
		markerLocation: null,
		markerMe: null,
		open: false,
		scrollTop: -1,
		svgLocation: null,
		svgMe: null,
		timeout: null
	};
	static template = v =>
		global.template`<style>
button-text.map {
	position: absolute;
	width: 30em;
	left: 50%;
	margin-left: -15em;
	margin-top: 0.5em;
	opacity: 0.7;
	font-size: 0.7em;
	display: none;
	z-index: 1;
	text-align: center;
}
</style>
<tabHeader>
	<tab onclick="pageSearch.selectTab('events')" i="events" class="tabActive">
		${ui.l('events.title')}
	</tab>
	<tab onclick="pageSearch.selectTab('contacts')" i="contacts">
		${ui.l('contacts.title')}
	</tab>
	<tab onclick="pageSearch.selectTab('locations')" i="locations">
		${ui.l('locations.title')}
	</tab>
</tabHeader>
<tabBody>
	<div class="events"></div>
	<div class="contacts" style="opacity:0;"></div>
	<div class="locations" style="opacity:0;"></div>
</tabBody>`;
	static contacts = {
		fieldValues: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input-checkbox label="search.matches" name="matches" value="true" ${v.matches}></input-checkbox>
<label class="locationPicker" onclick="ui.navigation.openLocationPicker(event)">${pageSearch.getTown()}</label>
<input-hashtags ids="${v.keywords}" text="${v.keywordsText}" name="keywords"></input-hashtags>
<explain class="searchKeywordHint">${ui.l('search.hintContact')}</explain>
<errorHint></errorHint>
<dialogButtons>
<button-text class="defaultButton" onclick="pageSearch.contacts.search()" label="search.action"></button-text>
</dialogButtons>
</form>`,
		getFields() {
			var v = {};
			if (pageSearch.contacts.fieldValues.keywords)
				v.keywords = pageSearch.contacts.fieldValues.keywords;
			if (pageSearch.contacts.fieldValues.keywordsText)
				v.keywordsText = pageSearch.contacts.fieldValues.keywordsText;
			if (pageSearch.contacts.fieldValues.matches)
				v.matches = ' checked="true"';
			return pageSearch.contacts.template(v);
		},
		getMatches() {
			var search = '(' + global.getRegEx('contact.skills', user.contact.skills) + ' or ' + global.getRegEx('contact.skillsText', user.contact.skillsText) + ')';
			if (global.config.searchMandatory && user.contact.skills && user.contact.skills.indexOf(global.config.searchMandatory) > -1) {
				search += ' and (';
				var s = user.contact.skills.split('|');
				for (var i = 0; i < s.length; i++) {
					if (s[i].indexOf(global.config.searchMandatory) == 0)
						search += global.getRegEx('contact.skills', s[i]) + ' or ';
				}
				search = search.substring(0, search.length - 4) + ')';
			}
			var gender = function (age, i) {
				if (age) {
					var ageSplit = age.split(','), s2 = '';
					if (ageSplit[0] > 18)
						s2 = 'contact.age>=' + ageSplit[0];
					if (ageSplit[1] < 99)
						s2 += (s2 ? ' and ' : '') + 'contact.age<=' + ageSplit[1];
					return 'contact.gender=' + i + (s2 ? ' and ' + s2 : '');
				}
				return '';
			}
			var s = gender(user.contact.ageMale, 1), g = '';
			if (s)
				g += ' or ' + s;
			s = gender(user.contact.ageFemale, 2);
			if (s)
				g += ' or ' + s;
			s = gender(user.contact.ageDivers, 3);
			if (s)
				g += ' or ' + s;
			if (g)
				search += ' and (' + g.substring(4) + ')';
			return search;
		},
		getSearch() {
			var s = '', s2 = '', s3 = '';
			if (ui.q('search tabBody div.contacts [name="matches"][checked="true"]'))
				s = ' and ' + pageSearch.contacts.getMatches();
			var v = ui.q('search tabBody div.contacts input-hashtags').getAttribute('text');
			if (v) {
				v = v.replace(/'/g, '\'\'').split('|');
				for (var i = 0; i < v.length; i++) {
					if (v[i]) {
						s2 = v[i].trim().toLowerCase();
						s3 += 'contact.idDisplay=\'' + v[i].trim() + '\' or (contact.search=true and (LOWER(contact.description) like \'%' + s2 + '%\' or LOWER(contact.pseudonym) like \'%' + s2 + '%\' or LOWER(contact.skillsText) like \'%' + s2 + '%\')) or ';
					}
				}
				s3 = s3.substring(0, s3.length - 4);
			}
			v = ui.q('search tabBody div.contacts input-hashtags').getAttribute('ids');
			if (v)
				s3 += (s3 ? ' or ' : '') + global.getRegEx('contact.skills', v);
			return (s3.indexOf('contact.idDisplay') > -1 ? '' : 'contact.id<>' + user.clientId + ' and ') + 'contact.id<>' + user.contact.id + s + (s3 ? ' and (' + s3 + ')' : '');
		},
		search() {
			if (ui.q('search tabBody div.contacts [name="matches"][checked="true"]') && !user.contact.skills && !user.contact.skillsText)
				ui.html('search tabBody div.contacts errorHint', ui.l('search.errorNoInterestText') + '<br/><br/><button-text onclick="ui.navigation.goTo(&quot;settings&quot;)">' + ui.l('search.errorNoInterestButton') + '</button-text>');
			else {
				ui.html('search tabBody div.contacts errorHint', '');
				pageSearch.contacts.fieldValues = formFunc.getForm('search tabBody div.contacts form').values;
				lists.load({
					webCall: 'search.contacts.search',
					latitude: geoData.getCurrent().lat,
					longitude: geoData.getCurrent().lon,
					distance: -1,
					query: 'contact_list',
					search: encodeURIComponent(pageSearch.contacts.getSearch())
				}, pageContact.listContacts, 'search tabBody>div.contacts', 'search');
				user.set('searchContacts', pageSearch.contacts.fieldValues);
			}
		}
	}
	static events = {
		fieldValues: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input-date name="date" type="search" value="${v.date}" style="margin-bottom:0.5em;"></input-date>
<label class="locationPicker" onclick="ui.navigation.openLocationPicker(event)">${pageSearch.getTown()}</label>
${v.keywords}
<explain class="searchKeywordHint">${ui.l('search.hintEvent')}</explain>
<errorHint></errorHint>
<dialogButtons>
<button-text class="defaultButton" onclick="pageSearch.events.search()" label="search.action"></button-text>
</dialogButtons>
</form>`,
		getFields() {
			var v = {};
			if (!pageSearch.events.fieldValues.keywords)
				pageSearch.events.fieldValues.keywords = '';
			if (global.config.eventNoHashtags)
				v.keywords = '<input value="' + pageSearch.events.fieldValues.keywords + '" name="keywords"></input>'
			else {
				if (!pageSearch.events.fieldValues.keywordsText)
					pageSearch.events.fieldValues.keywordsText = '';
				v.keywords = '<input-hashtags ids="' + pageSearch.events.fieldValues.keywords + '" text="' + pageSearch.events.fieldValues.keywordsText + '" name="keywords"></input-hashtags>'
			}
			v.date = pageSearch.events.fieldValues.date;
			return pageSearch.events.template(v);
		},
		getSearch(bounds) {
			var v, s = '';
			if (global.config.eventNoHashtags)
				v = ui.val('search tabBody div.events input');
			else
				v = ui.q('search tabBody div.events input-hashtags').getAttribute('text');
			if (v) {
				v = v.replace(/'/g, '\'\'').split('|');
				for (var i = 0; i < v.length; i++) {
					if (v[i]) {
						var l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						s += '((contact.search=true or event.price>0) and LOWER(contact.pseudonym' + l + 'contact.description' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER(')) + ') or ';
						s += 'LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l + 'event.description' + l + 'event.skillsText' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER(')) + ' or ';
					}
				}
				s = s.substring(0, s.length - 4);
			}
			if (!global.config.eventNoHashtags) {
				v = ui.q('search tabBody div.events input-hashtags').getAttribute('ids');
				if (v)
					s += (s ? ' or ' : '') + global.getRegEx('event.skills', v);
			}
			if (s)
				s = '(' + s + ') and ';
			if (bounds) {
				var b = pageSearch.map.canvas.getBounds();
				if (b) {
					var border = 0.1 * Math.abs(b.getSouthWest().lat() - b.getNorthEast().lat());
					s += (s ? ' and ' : '') + 'location.latitude>' + (b.getSouthWest().lat() + border);
					s += ' and location.latitude<' + (b.getNorthEast().lat() - border);
					border = 0.1 * Math.abs(b.getNorthEast().lng() - b.getSouthWest().lng());
					s += ' and location.longitude>' + (b.getSouthWest().lng() + border);
					s += ' and location.longitude<' + (b.getNorthEast().lng() - border);
				}
			}
			return s + 'event.endDate>=cast(\'' + global.date.local2server(new Date()).substring(0, 10) + '\' as timestamp)';
		},
		search() {
			pageSearch.events.fieldValues = formFunc.getForm('search tabBody div.events form').values;
			var type = ui.val('search tabBody div.events input-date');
			pageEvent.loadEvents({
				webCall: 'search.events.search',
				latitude: geoData.getCurrent().lat,
				longitude: geoData.getCurrent().lon,
				distance: 100,
				limit: -1,
				query: 'event_list',
				search: encodeURIComponent(pageSearch.events.getSearch())
			}, function (events) {
				var d = new Date();
				var twoWeeks = new Date();
				twoWeeks.setDate(twoWeeks.getDate() + 14);
				var today = d.toISOString().substring(0, 10);
				d.setDate(d.getDate() + 1);
				var tomorrow = d.toISOString().substring(0, 10);
				var sunday = new Date();
				sunday.setHours(23);
				sunday.setMinutes(59);
				sunday.setSeconds(59);
				while (sunday.getDay() != 0)
					sunday.setDate(sunday.getDate() + 1);
				var sundayNextWeek = new Date(sunday.getTime());
				sundayNextWeek.setDate(sundayNextWeek.getDate() + 7);
				var friday = new Date();
				friday.setHours(0);
				friday.setMinutes(0);
				friday.setSeconds(0);
				if (friday.getDay() < 5 && friday.getDay() > 0)
					while (friday.getDay() != 5)
						friday.setDate(friday.getDate() + 1);
				for (var i = events.length - 1; i >= 0; i--) {
					if (events[i] == 'outdated') {
						events.splice(i, events.length - i);
						break;
					}
				}
				for (var i = events.length - 1; i >= 0; i--) {
					if (type == 'today') {
						if (global.date.local2server(events[i].event.startDate).indexOf(today) != 0)
							events.splice(i, 1);
					} else if (type == 'tomorrow') {
						if (global.date.local2server(events[i].event.startDate).indexOf(tomorrow) != 0)
							events.splice(i, 1);
					} else if (type == 'thisWeek') {
						if (events[i].event.startDate > sunday)
							events.splice(i, 1);
					} else if (type == 'thisWeekend') {
						if (events[i].event.startDate < friday || events[i].event.startDate > sunday)
							events.splice(i, 1);
					} else if (type == 'nextWeek') {
						if (events[i].event.startDate < sunday || events[i].event.startDate > sundayNextWeek)
							events.splice(i, 1);
					} else if (type) {
						if (global.date.local2server(events[i].event.startDate).indexOf(type) != 0)
							events.splice(i, 1);
					} else if (events[i].event.startDate > twoWeeks)
						events.splice(i, 1);
				}
			});
			user.set('searchEvents', pageSearch.events.fieldValues);
		}
	}
	static locations = {
		fieldValues: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input-checkbox label="search.favorites" name="favorites" value="true" ${v.favorites}></input-checkbox>
<label class="locationPicker" onclick="ui.navigation.openLocationPicker(event)">${pageSearch.getTown()}</label>
<input-hashtags ids="${v.keywords}" text="${v.keywordsText}" name="keywords" class="location"></input-hashtags>
<explain class="searchKeywordHint">${ui.l('search.hintLocation')}</explain>
<errorHint></errorHint>
<dialogButtons>
<button-text class="defaultButton" onclick="pageSearch.locations.search()" label="search.action"></button-text>
<button-text onclick="pageSearch.toggleMap()" label="search.buttonMap"></button-text>
</dialogButtons>
<button-text class="map" onclick="pageSearch.locations.search(true)" label="search.map"></button-text>
<map style="display:none;"></map>
</form>`,
		getFields() {
			var v = {};
			if (pageSearch.locations.fieldValues.favorites)
				v.favorites = ' checked="true"';
			if (pageSearch.locations.fieldValues.keywords)
				v.keywords = pageSearch.locations.fieldValues.keywords;
			if (pageSearch.locations.fieldValues.keywordsText)
				v.keywordsText = pageSearch.locations.fieldValues.keywordsText;
			return pageSearch.locations.template(v);
		},
		getSearch(bounds) {
			var s = '';
			var v = ui.q('search tabBody div.locations input-hashtags').getAttribute('text');
			if (v) {
				v = v.replace(/'/g, '\'\'').split('|');
				for (var i = 0; i < v.length; i++) {
					if (v[i]) {
						var l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						s += '(LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER')) + ') or ';
					}
				}
				if (s)
					s = '(' + s.substring(0, s.length - 4) + ')';
			}
			v = ui.q('search tabBody div.locations input-hashtags').getAttribute('ids');
			if (v)
				s += (s ? ' or ' : '') + global.getRegEx('location.skills', v);
			if (ui.q('search tabBody div.locations [name="favorites"][checked="true"]'))
				s += (s ? ' and ' : '') + 'locationFavorite.favorite=true';
			if (bounds) {
				var b = pageSearch.map.canvas.getBounds();
				if (b) {
					var border = 0.1 * Math.abs(b.getSouthWest().lat() - b.getNorthEast().lat());
					s += (s ? ' and ' : '') + 'location.latitude>' + (b.getSouthWest().lat() + border);
					s += ' and location.latitude<' + (b.getNorthEast().lat() - border);
					border = 0.1 * Math.abs(b.getNorthEast().lng() - b.getSouthWest().lng());
					s += ' and location.longitude>' + (b.getSouthWest().lng() + border);
					s += ' and location.longitude<' + (b.getNorthEast().lng() - border);
				}
			}
			return s;
		},
		search(bounds) {
			pageSearch.locations.fieldValues = formFunc.getForm('search tabBody div.locations form').values;
			lists.load({
				webCall: 'search.locations.search',
				latitude: geoData.getCurrent().lat,
				longitude: geoData.getCurrent().lon,
				distance: -1,
				query: 'location_list',
				search: encodeURIComponent(pageSearch.locations.getSearch(bounds))
			}, pageLocation.listLocation, 'search tabBody>div.locations', 'search');
			user.set('searchLocations', pageSearch.locations.fieldValues);
		}
	}
	static getTown() {
		if (geoData.getCurrent().town)
			return geoData.getCurrent().town;
		return ui.l('search.unknownTown');
	}
	static init() {
		document.addEventListener('GeoLocation', function (event) {
			ui.html('search label.locationPicker', pageSearch.getTown());
		});
		if (!pageSearch.contacts.fieldValues)
			pageSearch.contacts.fieldValues = user.get('searchContacts') || {};
		if (!pageSearch.events.fieldValues)
			pageSearch.events.fieldValues = user.get('searchEvents') || {};
		if (!pageSearch.locations.fieldValues)
			pageSearch.locations.fieldValues = user.get('searchLocations') || {};
		var e = ui.q('search');
		if (!e.innerHTML) {
			e.innerHTML = pageSearch.template();
			ui.q('search tabBody div.contacts').innerHTML = pageSearch.contacts.getFields() + '<listResults></listResults>';
			ui.q('search tabBody div.events').innerHTML = pageSearch.events.getFields() + '<listResults></listResults>';
			ui.q('search tabBody div.locations').innerHTML = pageSearch.locations.getFields() + '<listResults></listResults>';
			formFunc.initFields(ui.q('search'));
		}
		if (!pageSearch.map.svgLocation)
			communication.ajax({
				url: '/images/locations.svg',
				webCall: 'search.init',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'black');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '60');
					pageSearch.map.svgLocation = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});
		if (!pageSearch.map.svgMe)
			communication.ajax({
				url: '/images/contacts.svg',
				webCall: 'search.init',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'black');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '20');
					pageSearch.map.svgMe = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});
	}
	static repeatSearch() {
		var type = ui.q('search tabHeader tab.tabActive').getAttribute('i');
		ui.q('search div.' + type + ' [name="keywords"]').value = '';
		pageSearch[type].search();
	}
	static scrollMap() {
		var prefix = 'search .locations ';
		if (ui.cssValue(prefix + 'map', 'display') == 'none')
			return;
		if (pageSearch.map.scrollTop != ui.q(prefix + 'listResults').scrollTop) {
			pageSearch.map.scrollTop = ui.q(prefix + 'listResults').scrollTop;
			clearTimeout(pageSearch.map.timeout);
			pageSearch.map.timeout = setTimeout(pageSearch.scrollMap, 100);
			return;
		}
		var rows = ui.qa(prefix + 'listResults list-row');
		var id = ui.q(prefix + 'listResults').scrollTop + ui.q(prefix + 'listResults').offsetTop, i = 0;
		for (; i < rows.length; i++) {
			if (rows[i].offsetTop >= id && rows[i].getAttribute('filtered') != 'true') {
				id = parseInt(rows[i].getAttribute('i'));
				break;
			}
		}
		if (id == pageSearch.map.id || !rows[i])
			return;
		ui.classRemove(prefix + 'listResults list-row.highlightMap', 'highlightMap');
		ui.classAdd(rows[i], 'highlightMap');
		pageSearch.map.id = id;
		var d = JSON.parse(decodeURIComponent(rows[i].getAttribute('data')));
		if (pageSearch.map.canvas) {
			pageSearch.map.markerLocation.setMap(null);
			ui.q('map').setAttribute('created', new Date().getTime());
			ui.q(prefix + 'button-text.map').style.display = null;
		} else {
			pageSearch.map.canvas = new google.maps.Map(ui.q('map'), { mapTypeId: google.maps.MapTypeId.ROADMAP, disableDefaultUI: true });
			pageSearch.map.canvas.addListener('bounds_changed', function () {
				if (new Date().getTime() - ui.q(prefix + 'map').getAttribute('created') > 2000)
					ui.q(prefix + 'button-text.map').style.display = 'inline-block';
			});
		}
		pageSearch.map.markerLocation = new google.maps.Marker({
			map: pageSearch.map.canvas,
			title: d.name,
			contentString: '',
			icon: {
				url: pageSearch.map.svgLocation,
				scaledSize: new google.maps.Size(40, 40),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(20, 40)
			},
			position: new google.maps.LatLng(d.latitude, d.longitude)
		});
	}
	static selectTab(id) {
		if (id == ui.q('search tabHeader tab.tabActive').getAttribute('i'))
			return;
		var animation = ui.q('search tabBody').getAttribute('animation');
		if (animation && new Date().getTime() - animation < 500)
			return;
		document.dispatchEvent(new CustomEvent('Navigation', { detail: { id: 'search', subId: id } }));
		ui.css('search tabBody>div', 'opacity', 1);
		ui.q('search tabBody').style.marginLeft = ((id == 'locations' ? 2 : id == 'contacts' ? 1 : 0) * -100) + '%';
		ui.attr('search tabBody', 'animation', new Date().getTime());
		ui.on('search tabBody', 'transitionend', function () {
			ui.css('search tabBody>div:not(.' + id + ')', 'opacity', 0);
		}, true);
		ui.classRemove('search tab', 'tabActive');
		ui.classAdd('search tab[i="' + (id ? id : 'events') + '"]', 'tabActive');
		ui.navigation.closeLocationPicker();
	}
	static swipeLeft() {
		var x = parseInt(ui.q('search tabBody').style.marginLeft) || 0;
		if (x == -200)
			ui.navigation.goTo('events');
		else if (x == -100)
			pageSearch.selectTab('locations');
		else
			pageSearch.selectTab('contacts');
	}
	static swipeRight() {
		var x = parseInt(ui.q('search tabBody').style.marginLeft) || 0;
		if (x == 0)
			ui.navigation.goTo('home', true);
		else if (x == -100)
			pageSearch.selectTab('events');
		else
			pageSearch.selectTab('contacts');
	}
	static toggleMap() {
		var prefix = 'search .locations ';
		if (!ui.q(prefix + 'list-row') && !ui.q(prefix + 'noResult')) {
			ui.on(document, 'List', pageSearch.toggleMap, true);
			pageSearch.locations.search();
		} else if (ui.q(prefix + 'map').getAttribute('created')) {
			ui.q(prefix + 'map').setAttribute('created', new Date().getTime());
			ui.toggleHeight(prefix + 'map', pageSearch.scrollMap);
			pageSearch.map.scrollTop = -1;
			pageSearch.map.id = -1;
			var latSW = -5000, lonSW = 5000, latNE = 5000, lonNE = -5000;
			var rows = ui.qa(prefix + 'listResults list-row');
			for (var i = 0; i < rows.length; i++) {
				var d2 = JSON.parse(decodeURIComponent(rows[i].getAttribute('data')));
				if (d2.latitude > latSW)
					latSW = d2.latitude;
				if (d2.longitude < lonSW)
					lonSW = d2.longitude;
				if (d2.latitude < latNE)
					latNE = d2.latitude;
				if (d2.longitude > lonNE)
					lonNE = d2.longitude;
			}
			var delta = 0.00005;
			pageSearch.map.canvas.fitBounds(new google.maps.LatLngBounds(
				new google.maps.LatLng(latSW + delta, lonSW - delta), //south west
				new google.maps.LatLng(latNE - delta, lonNE + delta) //north east
			));
			setTimeout(function () { ui.classRemove(prefix + 'list-row div.highlightMap', 'highlightMap'); }, 500);
		} else {
			ui.attr('map', 'created', new Date().getTime());
			communication.loadMap('pageSearch.toggleMap');
			ui.on(prefix + 'listResults', 'scroll', pageSearch.scrollMap);
		}
	}
}
