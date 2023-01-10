import { communication } from "./communication";
import { details } from "./details";
import { geoData } from "./geoData";
import { global } from "./global";
import { lists } from "./lists";
import { Contact, Location, model } from "./model";
import { pageContact } from "./pageContact";
import { pageHome } from "./pageHome";
import { pageLocation } from "./pageLocation";
import { formFunc, ui } from "./ui";
import { user } from "./user";

export { pageEvent };

class pageEvent {
	static filter = null;
	static nearByExec = null;
	static participations = null;
	static templateEdit = v =>
		global.template`<form name="editElement" onsubmit="return false">
<input type="hidden" name="id" value="${v.id}"/>
<input type="hidden" name="locationId" value="${v.locationID}"/>
<input type="hidden" name="confirm" />
${v.hint}
<field${v.displayLocation}>
	<label>${ui.l('events.location')}</label>
	<value style="text-align:center;">
		<input transient="true" name="location" onkeyup="pageEvent.locations()" />
		<eventLocationInputHelper><explain>${ui.l('events.locationInputHint')}</explain></eventLocationInputHelper>
		<buttontext onclick="pageLocation.edit()" class="bgColor eventLocationInputHelperButton">${ui.l('locations.new')}</buttontext>
	</value>
</field>
<field>
	<label>${ui.l('type')}</label>
	<value>
		<input type="radio" name="type" value="o" label="${ui.l('events.type_o')}" onclick="pageEvent.setForm()" ${v.type_o}/>
		<input type="radio" name="type" value="w1" label="${ui.l('events.type_w1')}" onclick="pageEvent.setForm()" ${v.type_w1}/>
		<input type="radio" name="type" value="w2" label="${ui.l('events.type_w2')}" onclick="pageEvent.setForm()" ${v.type_w2}/>
		<input type="radio" name="type" value="m" label="${ui.l('events.type_m')}" onclick="pageEvent.setForm()" ${v.type_m}/>
		<input type="radio" name="type" value="y" label="${ui.l('events.type_y')}" onclick="pageEvent.setForm()" ${v.type_y}/>
	</value>
</field>
<field>
	<label name="startDate">${ui.l('events.start')}</label>
	<value>
		<input type="datetime-local" name="startDate" placeholder="TT.MM.JJJJ HH:MM" value="${v.startDate}" step="900" min="${v.today}T00:00:00" />
	</value>
</field>
<field name="endDate">
	<label>${ui.l('events.end')}</label>
	<value>
		<input type="date" name="endDate" placeholder="TT.MM.JJJJ" value="${v.endDate}" min="${v.today}" />
	</value>
</field>
<field>
	<label>${ui.l('events.maxParticipants')}</label>
	<value>
		<input type="number" name="maxParticipants" maxlength="250" value="${v.maxParticipants}" />
	</value>
</field>
<field>
	<label>${ui.l('events.price')}</label>
	<value>
		<input type="number" step="any" name="price" value="${v.price}" />
	</value>
</field>
<field ${v.hideOwnerFields}>
	<label>${ui.l('picture')}</label>
	<value>
		<input type="file" name="image" accept=".gif, .png, .jpg" />
	</value>
</field>
<field ${v.hideOwnerFields}>
	<label>${ui.l('link')}</label>
	<value>
		<input type="url" name="link" maxlength="250" value="${v.link}" />
	</value>
</field>
<field>
	<label>${ui.l('description')}</label>
	<value>
		<textarea name="text" maxlength="1000">${v.text}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('events.visibility')}</label>
	<value>
		<input type="radio" name="visibility" value="2" label="${ui.l('events.visibility2')}" ${v.visibility2}/>
		<input type="radio" name="visibility" value="3" label="${ui.l('events.visibility3')}" ${v.visibility3}/>
	</value>
</field>
<field>
	<label>${ui.l('events.confirmLabel')}</label>
	<value>
		<input type="checkbox" name="eventconfirm" transient="true" label="${ui.l('events.confirm')}" value="1" ${v.confirm}/>
	</value>
</field>
<dialogButtons style="margin-bottom:0;">
	<buttontext onclick="pageEvent.save()" class="bgColor">${ui.l('save')}</buttontext>
	<buttontext onclick="pageLocation.deleteElement(${v.id},&quot;Event&quot;)" class="bgColor${v.hideDelete}" id="deleteElement">${ui.l('delete')}</buttontext>
	<popupHint></popupHint>
</dialogButtons>
</form>`;
	static templateDetail = v =>
		global.template`<text class="description${v.classParticipate}" ${v.oc}>
<div>${ui.l('events.createdBy')}<br/><a class="chatLinks" onclick="ui.navigation.autoOpen(global.encParam(&quot;p=${v.event.contactId}&quot;),event)"><img src="${v.imageEventOwner}"><br>${v.contact.pseudonym}</a></div>
${v.eventLinkOpen}
<div>${v.date}${v.endDate}</div>
<div>${v.event.text}${v.eventMore}</div>
<div>${v.eventMustBeConfirmed}</div>
<div>${v.eventPrice}</div>
<div>${v.maxParticipants}</div>
<div>${v.reason}</div>
<span id="eventParticipants"></span>
${v.eventLinkClose}
${v.eventParticipationButtons}
</text>`;
	static templateSearch = v =>
		global.template`<form onsubmit="return false">
<input type="checkbox" name="filterCategories" value="0" label="${ui.categories[0].label}" onclick="pageLocation.filterList()" ${v.valueCat0}/>
<input type="checkbox" name="filterCategories" value="1" label="${ui.categories[1].label}" onclick="pageLocation.filterList()" ${v.valueCat1}/>
<input type="checkbox" name="filterCategories" value="2" label="${ui.categories[2].label}" onclick="pageLocation.filterList()" ${v.valueCat2}/>
<input type="checkbox" name="filterCategories" value="3" label="${ui.categories[3].label}" onclick="pageLocation.filterList()" ${v.valueCat3}/>
<input type="checkbox" name="filterCategories" value="4" label="${ui.categories[4].label}" onclick="pageLocation.filterList()" ${v.valueCat4}/>
<input type="checkbox" name="filterCategories" value="5" label="${ui.categories[5].label}" onclick="pageLocation.filterList()" ${v.valueCat5}/>
<filterSeparator></filterSeparator>
<input type="checkbox" label="${ui.l('search.matches')}" name="filterMatchesOnly" ${v.valueMatchesOnly}/>
<filterSeparator></filterSeparator>
<input type="text" name="filterKeywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.valueKeywords}/>
<explain class="searchKeywordHint">${ui.l('search.hintLocation')}</explain>
<errorHint></errorHint>
<buttontext class="bgColor defaultButton" onclick="pageEvent.search()">${ui.l('search.action')}</buttontext></form>`;
	static confirmMarketing(event) {
		communication.ajax({
			url: global.server + 'action/requestMarketing?id=' + ui.q('detail card:last-child').getAttribute('i'),
			method: 'POST',
			success(r) {
				event.target.outerHTML = ui.l('locations.marketing2');
			}
		});
	}
	static detail(v) {
		v.copyLinkHint = ui.l('copyLinkHint.event');
		if (v.event.contactId != user.contact.id)
			v.hideMeEdit = ' noDisp';
		if (v.event.type == 'o') {
			if (v.event.marketingEvent && v.event.contactId == user.contact.id)
				v.event.text = '<b>' + ui.l('events.acceptedMarketingEvent') + '</b><br/>' + v.event.text;
		} else {
			var s = global.date.formatDate(v.event.endDate);
			v.endDate = ' (' + ui.l('events.type_' + v.event.type) + ' ' + ui.l('to') + ' ' + s.substring(s.indexOf(' ') + 1, s.lastIndexOf(' ')) + ')';
		}
		if (!v.locID)
			v.event.text = ui.categories[v.event.category].label + '<br/>' + v.event.text;
		v.id = pageEvent.getId(v);
		if (('' + v.id).indexOf('_') < 0) {
			v.date = global.date.formatDate(v.event.startDate);
			v.date = '<eventOutdated>&nbsp;' + v.date;
			v[v.endDate ? 'endDate' : 'date'] += '&nbsp;</eventOutdated>';
		} else {
			var x = { id: v.id.split('_')[0], date: v.id.split('_')[1] };
			var d = global.date.getDateFields(x.date);
			var d2 = global.date.getDateFields(v.event.startDate);
			d.hour = d2.hour;
			d.minute = d2.minute;
			v.date = global.date.formatDate(d);
			v.eventParticipationButtons = pageEvent.getParticipateButton(x, v);
			var p = pageEvent.getParticipation(x);
			if (p.state == 1)
				v.classParticipate = ' participate';
			else if (p.state == -1 && v.event.confirm == 1) {
				v.classParticipate = ' canceled';
				v.reason = ui.l('events.canceled') + p.reason;
			}
			communication.ajax({
				url: global.server + 'db/list?query=contact_eventParticipateCount&search=' + encodeURIComponent('eventParticipate.state=1 and eventParticipate.eventId=' + x.id + ' and eventParticipate.eventDate=\'' + x.date + '\''),
				responseType: 'json',
				success(r) {
					if (r[1][0] > -1) {
						var e = ui.q('detail card[i="' + v.id + '"] participantCount');
						if (e && r[1][0] > 0)
							e.innerHTML = r[1][0] + ' ';
						if (!v.event.maxParticipants || r[1][0] < v.event.maxParticipants) {
							e = ui.q('detail card[i="' + v.id + '"] buttontext[pID]');
							if (e)
								e.style.display = '';
						}
					}
				}
			});
		}
		if (v.ownerId && v.event.link) {
			v.eventLinkOpen = '<a onclick="ui.navigation.openHTML(&quot;' + v.event.link + '&quot;)">';
			v.eventLinkClose = '</a>';
			v.eventMore = ' ' + ui.l('locations.clickForMoreDetails');
		}
		if (v.event.price > 0)
			v.eventPrice = '<div>' + ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2)) + '</div>';
		if (v.event.maxParticipants)
			v.maxParticipants = ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
		if (v.event.confirm == 1)
			v.eventMustBeConfirmed = ui.l('events.participationMustBeConfirmed');
		if (v.contact.imageList)
			v.imageEventOwner = global.serverImg + v.contact.imageList;
		else
			v.imageEventOwner = 'images/contact.svg" style="padding:1em;';
		v.hideMeFavorite = ' noDisp';
		v.hideMeEvents = ' noDisp';
		v.hideMeMarketing = ' noDisp';
		v.editAction = 'pageEvent.edit(' + v.locID + ',' + v.event.id + ')';
		return pageEvent.templateDetail(v);
	}
	static edit(locationID, id) {
		ui.navigation.hideMenu();
		if (id)
			pageEvent.editInternal(locationID, id, JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data'))).event);
		else
			pageEvent.editInternal(locationID);
	}
	static editInternal(locationID, id, v) {
		if (!id && locationID && formFunc.getDraft('event' + locationID)) {
			v = formFunc.getDraft('event' + locationID).values;
			if (v.startDate &&
				global.date.server2Local(v.startDate).getTime() < new Date().getTime())
				v.startDate = null;
		}
		if (!v)
			v = {};
		var d;
		if (v.startDate) {
			d = global.date.getDateFields(global.date.server2Local(v.startDate));
			v.startDate = d.year + '-' + d.month + '-' + d.day + 'T' + d.hour + ':' + d.minute;
		}
		if (!id)
			v.hideDelete = ' noDsip';
		d = new Date();
		v.today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
		v.id = id;
		if (!id)
			v.hint = '<div>' + ui.l('events.newHint') + '</div>';
		v.locationID = locationID;
		if (locationID)
			v.displayLocation = ' style="display:none;"'
		if (!v.type || v.type == 'o')
			v.type_o = ' checked';
		if (v.type == 'w1')
			v.type_w1 = ' checked';
		if (v.type == 'w2')
			v.type_w2 = ' checked';
		if (v.type == 'm')
			v.type_m = ' checked';
		if (v.type == 'y')
			v.type_y = ' checked';
		if (!v.ownerId || v.ownerId != user.contact.id)
			v.hideOwnerFields = 'style="display:none;"';
		if (v.confirm)
			v.confirm = ' checked';
		if (!v.visibility)
			v.visibility = '3';
		v['visibility' + v.visibility] = ' checked';
		if (!v.startDate) {
			d = new Date();
			d.setDate(d.getDate() + 1);
			v.startDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + 'T' + ('0' + d.getHours()).slice(-2) + ':00';
		}
		if (!v.endDate) {
			d = new Date();
			d.setMonth(d.getMonth() + 6);
			v.endDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
		}
		ui.navigation.openPopup(ui.l('events.' + (id ? 'edit' : 'new')), pageEvent.templateEdit(v), 'pageEvent.saveDraft()');
		pageEvent.setForm();
		pageEvent.locationsOfPastEvents();
	}
	static getCalendarList(data, onlyMine) {
		if (!data || data.length == 0)
			return '';
		var today = new Date();
		var s;
		var todayPlus14 = new Date();
		var actualEvents = [], actualEventsIndex = [], otherEvents = [], otherEventsIndex = [];
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		todayPlus14.setDate(todayPlus14.getDate() + 13);
		todayPlus14.setHours(23);
		todayPlus14.setMinutes(59);
		todayPlus14.setSeconds(59);
		for (var i = 1; i < data.length; i++) {
			var v = model.convert(new Location(), data, i);
			var d1 = global.date.server2Local(v.event.startDate);
			var d2 = global.date.server2Local(v.event.endDate);
			var added = false;
			if (d1 < todayPlus14 && d2 > today) {
				if (v.event.type == 'w1') {
					while (d1 < today)
						d1.setDate(d1.getDate() + 7);
				} else if (v.event.type == 'w2') {
					while (d1 < today)
						d1.setDate(d1.getDate() + 14);
				} else if (v.event.type == 'm') {
					while (d1 < today)
						d1.setMonth(d1.getMonth() + 1);
				} else if (v.event.type == 'y') {
					while (d1 < today)
						d1.setFullYear(d1.getFullYear() + 1);
				}
				do {
					if (d1 > today && (!added || d1 < todayPlus14)) {
						s = pageEvent.getParticipation({ id: v.event.id, date: d1.getFullYear() + '-' + ('0' + (d1.getMonth() + 1)).slice(-2) + '-' + ('0' + d1.getDate()).slice(-2) });
						if (!onlyMine || s.id || v.event.contactId == user.contact.id) {
							added = true;
							if (!actualEvents[d1.getTime() + '.' + v.event.id]) {
								var v2 = JSON.parse(JSON.stringify(v));
								v2.event.startDate = new Date(d1.getTime());
								actualEventsIndex.push(d1.getTime() + '.' + v.event.id);
								actualEvents[d1.getTime() + '.' + v.event.id] = v2;
							}
						}
					}
					if (v.event.type == 'w1')
						d1.setDate(d1.getDate() + 7);
					else if (v.event.type == 'w2')
						d1.setDate(d1.getDate() + 14);
					else if (v.event.type == 'm')
						d1.setMonth(d1.getMonth() + 1);
					else if (v.event.type == 'y')
						d1.setFullYear(d1.getFullYear() + 1);
					else
						break;
				} while (v.event.type != 'o' && d1 < todayPlus14);
			}
			if (onlyMine && !added && user.contact.id == v.event.contactId && !otherEvents[d1.getTime() + '.' + v.event.id]) {
				v.event.startDate = global.date.server2Local(v.event.startDate);
				otherEvents[d1.getTime() + '.' + v.event.id] = v;
				otherEventsIndex.push(d1.getTime() + '.' + v.event.id);
			}
		}
		actualEventsIndex.sort();
		var a = [];
		a.push(data[0]);
		for (var i = 0; i < actualEventsIndex.length; i++)
			a.push(actualEvents[actualEventsIndex[i]]);
		if (otherEventsIndex.length > 0) {
			otherEventsIndex.sort();
			a.push('outdated');
			for (var i = 0; i < otherEventsIndex.length; i++)
				a.push(otherEvents[otherEventsIndex[i]]);
		}
		return a;
	}
	static getFilterFields() {
		var v = {};
		var l = lists.data[ui.navigation.getActiveID()];
		if (pageEvent.filter.filterCategories) {
			var c = pageEvent.filter.filterCategories.split('\u0015');
			for (var i = 0; i < c.length; i++)
				v['valueCat' + c[i]] = ' checked="true"';
		}
		if (pageEvent.filter.filterKeywords)
			v.valueKeywords = ' value="' + pageEvent.filter.filterKeywords + '"';
		else if (geoData.currentTown)
			v.valueKeywords = ' value="' + geoData.currentTown + '"';
		if (pageEvent.filter.filterMatchesOnly == 'on')
			v.valueMatchesOnly = ' checked="true"';
		return pageEvent.templateSearch(v);
	}
	static getId(v) {
		var endDate = global.date.server2Local(v['event.endDate'] || v.event.endDate), today = new Date(), id = v.id || v['event.id'];
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		if (('' + v.id).indexOf('_') < 0 && (endDate.getFullYear() > today.getFullYear() || endDate.getFullYear() == today.getFullYear() &&
			(endDate.getMonth() > today.getMonth() || endDate.getMonth() == today.getMonth() &&
				endDate.getDate() >= today.getDate()))) {
			var d = global.date.server2Local(v['event.startDate'] || v.event.startDate), t = v['event.type'] || v.event.type;
			if (t == 'w1') {
				while (d < today)
					d.setDate(d.getDate() + 7);
			} else if (t == 'w2') {
				while (d < today)
					d.setDate(d.getDate() + 14);
			} else if (t == 'm') {
				while (d < today)
					d.setMonth(d.getMonth() + 1);
			} else if (t == 'y') {
				while (d < today)
					d.setFullYear(d.getFullYear() + 1);
			}
			id += '_' + d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
		}
		return id;
	}
	static getParticipateButton(p, v) {
		var participation = pageEvent.getParticipation(p);
		if (v.event.confirm && participation.state == -1)
			return '';
		var text = '<div style="margin:1em 0;">';
		text += '<buttontext pID="' + (participation.id ? participation.id : '') + '" s="' + (participation.id ? participation.state : '') + '" confirm="' + v.event.confirm + '" class="bgColor" onclick="pageEvent.participate(event,' + JSON.stringify(p).replace(/"/g, '&quot;') + ')" max="' + (v.maxParticipants ? v.maxParticipants : 0) + '" style="display:none;">' + ui.l('events.participante' + (participation.state == 1 ? 'Stop' : '')) + '</buttontext>';
		text += '<buttontext class="bgColor" onclick="pageEvent.toggleParticipants(event,' + JSON.stringify(p).replace(/"/g, '&quot;') + ',' + v.event.confirm + ')"><participantCount></participantCount>' + ui.l('events.participants') + '</buttontext>';
		text += '</div><text name="participants" style="margin:0 -1em;"></text>';
		return text;
	}
	static getParticipation(p) {
		if (pageEvent.participations) {
			for (var i = 0; i < pageEvent.participations.length; i++) {
				if (pageEvent.participations[i].eventId == p.id && pageEvent.participations[i].eventDate == p.date)
					return pageEvent.participations[i];
			}
		}
		return {};
	}
	static getParticipationNext(eventId) {
		if (pageEvent.participations) {
			var today = new Date();
			today.setDate(today.getDate() - 1);
			for (var i = 0; i < pageEvent.participations.length; i++) {
				if (global.date.server2Local(pageEvent.participations[i].eventDate).getTime() > today &&
					(!eventId || pageEvent.participations[i].event.id == eventId))
					return pageEvent.participations[i];
			}
		}
	}
	static getSearch() {
		var s = '';
		if (ui.q('events filters [name="filterMatchesOnly"]:checked'))
			s = pageLocation.getSearchMatches();
		var c = '', d = '';
		var cats = [];
		var e = ui.qa('events filters [name="filterCategories"]:checked');
		if (e) {
			for (var i = 0; i < e.length; i++) {
				cats.push(e[i].value);
				c += 'location.category like \'%' + e[i].value + '%\' or event.category like \'%' + e[i].value + '%\' or ';
			}
		}
		if (c)
			s += (s ? ' and ' : '') + '(' + c.substring(0, c.length - 4) + ')';
		else {
			for (var i = 0; i < ui.categories.length; i++)
				cats.push(i);
		}
		var v = ui.val('events filters [name="filterKeywords"]').trim();
		if (v) {
			v = v.replace(/'/g, '\'\'').split(' ');
			for (var i = 0; i < v.length; i++) {
				if (v[i].trim()) {
					v[i] = v[i].trim().toLowerCase();
					var att = '', l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
					for (var i2 = 0; i2 < cats.length; i2++) {
						for (var i3 = 0; i3 < ui.categories[cats[i2]].subCategories.length; i3++) {
							if (ui.categories[cats[i2]].subCategories[i3].toLowerCase().indexOf(v[i]) > -1)
								att += '(location.category like \'%' + cats[i2] + '%\' and location.attr' + cats[i2] + ' like \'%' + (i3 < 10 ? '00' : i3 < 100 ? '0' : '') + i3 + '%\') or ';
						}
					}
					d += '(LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l;
					d = d.substring(0, d.lastIndexOf('LOWER'));
					if (att)
						d += att;
					d = d.substring(0, d.length - 4) + ') and ';
				}
			}
			if (d)
				d = '(' + d.substring(0, d.length - 5) + ')';
		}
		if (d)
			s += (s ? ' and ' : '') + d;
		return s;
	}
	static init() {
		if (!pageEvent.filter)
			pageEvent.filter = formFunc.getDraft('searchEvents') || {};
		communication.ajax({
			url: global.server + 'db/list?query=contact_listEventParticipate&search=' + encodeURIComponent('eventParticipate.contactId=' + user.contact.id),
			responseType: 'json',
			success(r) {
				pageEvent.participations = [];
				geoData.trackAll = null;
				var today = global.date.local2server(new Date());
				for (var i = 1; i < r.length; i++) {
					var e = model.convert(new Contact(), r, i);
					var e2 = e.eventParticipate;
					e2.event = e.event;
					pageEvent.participations.push(e2);
					if (e2.event.contactId == user.contact.id && today.indexOf(e2.eventDate) == 0) {
						e = global.date.server2Local(e2.event.startDate);
						geoData.trackAll = e.getHours();
					}
				}
				pageEvent.participations.sort(
					function (a, b) {
						return a.eventDate > b.eventDate || a.eventDate == b.eventDate && a.event.startDate.substring(11) > b.event.startDate.substring(11) ? 1 : -1
					});
				if (ui.navigation.getActiveID() == 'home')
					pageHome.init();
			}
		});
	}
	static listEvents(l) {
		var activeID = ui.navigation.getActiveID()
		if (activeID == 'search')
			ui.attr('search', 'type', 'events');
		var as = pageEvent.getCalendarList(l);
		lists.data[activeID] = as;
		return pageEvent.listEventsInternal(as);
	}
	static listEventsInternal(as, date) {
		if (as.length < 2)
			return '';
		var s = '', v, outdated = false;
		var current = '', dateString;
		if (date) {
			dateString = global.date.formatDate(date, 'weekdayLong');
			dateString = dateString.substring(0, dateString.lastIndexOf(' '));
		}
		var bg = 'mainBG';
		for (var i = 1; i < as.length; i++) {
			if (as[i] == 'outdated') {
				if (date)
					break;
				outdated = true;
				s += '<listSeparator style="margin-top:2em;">' + ui.l('events.outdated') + '</listSeparator>';
			} else {
				v = as[i];
				var startDate = global.date.server2Local(v.event.startDate);
				var s2 = global.date.formatDate(startDate, 'weekdayLong');
				var s3 = s2.substring(0, s2.lastIndexOf(' '));
				if (!date || s3 == dateString) {
					if (s3 != current) {
						current = s3;
						if (!outdated && !date)
							s += '<listSeparator>' + global.date.getDateHint(startDate).replace('{0}', s3) + '</listSeparator>';
					}
					var t = global.date.formatDate(startDate);
					t = t.substring(t.lastIndexOf(' ') + 1);
					if (v.name)
						v.name = t + ' ' + v.name;
					else {
						v.name = t + ' ' + v.contact.pseudonym + (v.contact.age ? ' (' + v.contact.age + ')' : '');
						v._message1 = ui.categories[v.event.category].label;
					}
					if (v.ownerId == v.contact.id)
						v._message = '<span class="highlightColor">' + v.event.text + '</span><br/>';
					else
						v._message = v.event.text + '<br/>';
					v.locID = v.id;
					pageLocation.listInfos(v);
					v._message += v._message1 ? v._message1 : v._message2 ? v._message2 : '';
					v.id = v.event.id;
					v.classFavorite = v.locationFavorite.favorite ? ' favorite' : '';
					if (!outdated) {
						var d = global.date.getDateFields(v.event.startDate);
						var state = pageEvent.getParticipation({ id: v.id, date: d.year + '-' + d.month + '-' + d.day }).state;
						if (state == 1)
							v.classFavorite += ' participate';
						else if (state == -1 && v.event.confirm == 1)
							v.classFavorite += ' canceled';
						v.id += '_' + d.year + '-' + d.month + '-' + d.day;
					}
					v.classBGImg = v.imageList ? '' : bg;
					if (v.event.imageList)
						v.image = global.serverImg + v.event.imageList;
					else if (v.imageList)
						v.image = global.serverImg + v.imageList;
					else if (v.contact.imageList)
						v.image = global.serverImg + v.contact.imageList;
					else if (v.id)
						v.image = 'images/event.svg" style="padding: 1em;';
					else
						v.image = 'images/contact.svg" style="padding: 1em;';
					v.classBg = v.ownerId ? 'bgBonus' : bg;
					if (v.parkingOption) {
						if (v.parkingOption.indexOf('1') > -1 ||
							v.parkingOption.indexOf('2') > -1)
							v.parking = ui.l('locations.parkingPossible');
						else if (v.parkingOption.indexOf('4') > -1)
							v.parking = ui.l('locations.parking4');
					}
					if (v._isOpen > 0)
						v.open = ui.l('locations.open');
					else if (v._openTimesEntries > 0)
						v.open = ui.l('locations.closed');
					v._geolocationDistance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 9.5 ? 0 : 1).replace('.', ',') : '';
					v.type = 'Event';
					if (ui.navigation.getActiveID() == 'settings3')
						v.oc = 'pageSettings.unblock(' + v.id + ',' + v.block.id + ')';
					else
						v.oc = 'details.open(&quot;' + v.id + '&quot;,&quot;location_listEvent&search=' + encodeURIComponent('event.id=' + v.event.id) + '&quot;,pageLocation.detailLocationEvent)';
					s += pageLocation.templateList(v);
				}
			}
		}
		return s;
	}
	static listEventsMy(l) {
		var as = pageEvent.getCalendarList(l, true);
		lists.data[ui.navigation.getActiveID()] = as;
		return pageEvent.listEventsInternal(as);
	}
	static loadPotentialParticipants(category, visibility) {
		var i = ui.q('detail card:last-child').getAttribute('i');
		if (ui.q('detail card[i="' + i + '"] [name="potentialParticipants"] detailTogglePanel').innerText) {
			details.togglePanel(ui.q('detail card[i="' + i + '"] [name="potentialParticipants"]'));
			return;
		}
		var search = (visibility == 1 ? 'contactLink.status=\'Friends\'' : pageContact.getSearchMatches()) +
			' and (length(contact.attr' + category + ')>0 or length(contact.attr' + category + 'Ex)>0) and contact.id<>' + user.contact.id;
		communication.loadList('query=contact_list&distance=50&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent(search),
			function (r) {
				ui.q('detail card[i="' + i + '"] [name="potentialParticipants"] detailTogglePanel').innerHTML = pageContact.listContacts(r);
				details.togglePanel(ui.q('detail card[i="' + i + '"] [name="potentialParticipants"]'));
			});
	}
	static locations() {
		clearTimeout(pageEvent.nearByExec);
		var s = ui.q('popup input[name="location"]').value.trim();
		ui.q('popup buttontext.eventLocationInputHelperButton').style.display = '';
		if (s.length < 4) {
			ui.q('popup eventLocationInputHelper').innerHTML = '<explain>' + ui.l('events.locationInputHint') + '</explain>';
			return;
		}
		pageEvent.nearByExec = setTimeout(function () {
			communication.ajax({
				url: global.server + 'action/searchLocation?search=' + encodeURIComponent(s),
				responseType: 'json',
				success(r) {
					var s = '';
					for (var i = 0; i < r.length; i++)
						s += '<li i="' + r[i].id + '" onclick="pageEvent.locationSelected(this)">' + r[i].name + '<br/>' + r[i].address.replace(/\n/g, global.separator) + '</li>';
					ui.q('popup eventLocationInputHelper').innerHTML = s ? '<ul>' + s + '</ul>' : ui.l('events.locationInputNoHit');
				}
			});
		}, 1000);
	}
	static locationsOfPastEvents() {
		communication.ajax({
			url: global.server + 'db/list?query=location_listEvent&search=' + encodeURIComponent('event.locationId is not null and event.contactId=' + user.contact.id),
			responseType: 'json',
			success(r) {
				var s = '', processed = {};
				for (var i = 1; i < r.length; i++) {
					var l = model.convert(new Location(), r, i);
					if (!processed[l.id]) {
						s += '<li i="' + l.id + '" onclick="pageEvent.locationSelected(this)">' + l.name + '<br/>' + l.address.replace(/\n/g, global.separator) + '</li>';
						processed[l.id] = 1;
					}
				}
				if (s) {
					var i = 0;
					var f = function () {
						i++;
						var e = ui.q('popup eventLocationInputHelper');
						if (e)
							e.innerHTML = '<explain>' + ui.l('events.locationInputHint') + '<br/>' + ui.l('events.locationInputHint2') + '</explain><ul>' + s + '</ul>';
						else if (i < 10)
							setTimeout(f, 50);
					};
					setTimeout(f, 50);
				}
			}
		});
	}
	static locationSelected(e) {
		ui.q('popup input[name="locationId"]').value = e.getAttribute('i');
		ui.q('popup eventLocationInputHelper').innerHTML = e.innerHTML;
		ui.q('popup buttontext.eventLocationInputHelperButton').style.display = 'none';
	}
	static participate(event, id) {
		event.stopPropagation();
		var button = event.target;
		var participateID = button.getAttribute('pID');
		var d = { classname: 'EventParticipate', values: {} };
		if (participateID) {
			d.values.state = button.getAttribute('s') == 1 ? -1 : 1;
			d.id = participateID;
			if (button.getAttribute('confirm') == 1) {
				if (!ui.q('#stopParticipateReason')) {
					ui.navigation.openPopup(ui.l('events.stopParticipate'), ui.l('events.stopParticipateText') + '<br/><textarea id="stopParticipateReason" placeholder="' + ui.l('events.stopParticipateHint') + '" style="margin-top:0.5em;"></textarea><buttontext class="bgColor" style="margin-top:1em;" pID="' + button.getAttribute('pID') + '" s="' + button.getAttribute('s') + '" confirm="1" onclick="pageEvent.participate(event,' + JSON.stringify(id).replace(/"/g, '&quot;') + ')">' + ui.l('events.stopParticipateButton') + '</buttontext>');
					return;
				}
				if (!ui.q('#stopParticipateReason').value)
					return;
				d.values.reason = ui.q('#stopParticipateReason').value;
			}
		} else {
			d.values.state = 1;
			d.values.eventId = id.id;
			d.values.eventDate = id.date;
		}
		communication.ajax({
			url: global.server + 'db/one',
			method: participateID ? 'PUT' : 'POST',
			body: d,
			success(r) {
				if (r)
					ui.attr(button, 'pID', r);
				var e = ui.q('detail card[i="' + id.id + '_' + id.date + '"] participantCount');
				if (button.getAttribute('s') == '1') {
					ui.classRemove('detail card:last-child .event', 'participate');
					ui.classRemove('row[i="' + id.id + '_' + id.date + '"]', 'participate');
					e.innerHTML = e.innerHTML && parseInt(e.innerHTML) > 1 ? (parseInt(e.innerHTML) - 1) + ' ' : '';
					if (button.getAttribute('confirm') == '1') {
						ui.classAdd('detail card:last-child .event', 'canceled');
						ui.classAdd('row[i="' + id.id + '_' + id.date + '"]', 'canceled');
						ui.q('detail card:last-child buttontext[pID="' + participateID + '"]').outerHTML = '';
					} else {
						ui.attr(button, 's', '-1');
						button.innerText = ui.l('events.participante');
					}
				} else {
					ui.attr(button, 's', '1');
					button.innerText = ui.l('events.participanteStop');
					e.innerHTML = e.innerHTML ? (parseInt(e.innerHTML) + 1) + ' ' : '1 ';
					ui.classAdd('detail card:last-child .event', 'participate');
					ui.classAdd('row[i="' + id.id + '_' + id.date + '"]', 'participate');
				}
				e = ui.q('detail card:last-child[i="' + id.id + '_' + id.date + '"] [name="participants"]');
				e.innerHTML = '';
				e.removeAttribute('h');
				e.style.display = 'none';
				ui.navigation.hidePopup();
				pageEvent.init();
			}
		});
	}
	static refreshToggle() {
		var e = ui.q('detail card:last-child [name="events"]');
		if (e) {
			var id = ui.q('detail card:last-child').getAttribute('i');
			ui.toggleHeight(e, function () {
				e.innerHTML = '';
				pageEvent.toggle(id);
			});
		}
	}
	static requestOwnerShip() {
		var ownerId = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data'))).ownerId;
		if (ownerId == user.contact.id) {
			var id = ui.q('detail card:last-child').getAttribute('i');
			communication.ajax({
				url: global.server + 'action/marketing?id=' + id,
				success(r) {
					ui.navigation.openHTML(r, 'marketing' + id);
				}
			});
		} else if (ownerId)
			ui.navigation.openPopup(ui.l('locations.marketing'), ui.l('locations.marketingOccupied'));
		else
			ui.navigation.openPopup(ui.l('locations.marketing'), '<marketing>' + ui.l('locations.marketing1') + '<br/><br/><buttontext class="bgColor" onclick="pageEvent.confirmMarketing(event)">' + ui.l('locations.marketingConfirm') + '</buttontext></marketing>');
	}
	static reset() {
		pageEvent.participations = null;
	}
	static save() {
		var d1, d2;
		var start = ui.q('popup input[name="startDate"]');
		var end = ui.q('popup input[name="endDate"]');
		var text = ui.q('popup [name="text"]');
		var id = ui.q('popup [name="id"]').value;
		ui.html('popup popupHint', '');
		formFunc.resetError(start);
		formFunc.resetError(end);
		formFunc.resetError(text);
		formFunc.resetError(ui.q('popup input[name="visibility"]'));
		if (!text.value)
			formFunc.setError(text, 'error.description');
		else
			formFunc.validation.filterWords(text);
		if (!start.value)
			formFunc.setError(start, 'events.errorDate');
		else {
			try {
				if (start.value.indexOf(':') < 0)
					throw 'NaN';
				d1 = global.date.local2server(start.value);
				if (!id && d1 < new Date())
					formFunc.setError(start, 'events.errorDateTooSmall');
			} catch (e) {
				formFunc.setError(start, 'events.errorDateFormat');
			}
		}
		if (!ui.q('popup [name="locationId"]').value)
			formFunc.setError(ui.q('popup input[name="location"]'), 'events.errorLocation');
		if (!ui.q('popup [name="type"]').checked) {
			if (!end.value)
				formFunc.setError(end, 'events.errorDateNoEnd');
			else {
				try {
					d2 = global.date.local2server(end.value);
					if (d1 && d1 > d2)
						formFunc.setError(end, 'events.errorDateEndTooSmall');
				} catch (e) {
					formFunc.setError(end, 'events.errorDateEndFormat');
				}
			}
		}
		if (v.values.visibility == 2 && (!user.contact.attr || !user.contact.attrInterest))
			formFunc.setError(ui.q('popup input[name="visibility"]'), 'events.errorVisibility');
		if (ui.q('popup errorHint'))
			return;
		if (ui.q('popup [name="type"]').checked)
			end.value = start.value.substring(0, start.value.lastIndexOf('T'));
		ui.q('popup [name="confirm"]').value = ui.q('popup [name="eventconfirm"]:checked') ? 1 : 0;
		var v = formFunc.getForm('popup form');
		v.classname = 'Event';
		if (id)
			v.id = id;
		communication.ajax({
			url: global.server + 'db/one',
			method: id ? 'PUT' : 'POST',
			body: v,
			success() {
				ui.navigation.hidePopup();
				formFunc.removeDraft('event' + v.locationId + (id ? '_' + id : ''));
				pageEvent.refreshToggle();
			}
		});
	}
	static saveDraft() {
		formFunc.saveDraft('event', formFunc.getForm('popup form'));
	}
	static search() {
		pageEvent.filter = formFunc.getForm('events filters form').values;
		communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_listEventCurrent&search=' + encodeURIComponent(pageEvent.getSearch()), pageEvent.listEvents, 'events', 'search');
		formFunc.saveDraft('searchEvents', pageEvent.filter);
	}
	static setForm() {
		var b = ui.q('popup [name="type"]').checked;
		ui.q('popup label[name="startDate"]').innerText = ui.l('events.' + (b ? 'date' : 'start'));
		ui.css('popup field[name="endDate"]', 'display', b ? 'none' : '');
	}
	static showNext(event, next) {
		var e2 = event.target;
		var e = e2.parentNode.parentNode;
		if (ui.classContains(e.parentNode, 'animated'))
			return;
		if (next) {
			e2 = e.nextElementSibling;
			var last = false;
			if (!e2) {
				e2 = e.parentNode.children[0];
				last = true;
			}
			ui.css(e2, 'marginLeft', '100%');
			ui.css(e2, 'display', 'inline-block');
			if (last)
				ui.css(e, 'marginTop', '-' + e.offsetHeight + 'px');
			else
				ui.css(e2, 'marginTop', '-' + e2.offsetHeight + 'px');
			ui.navigation.animation(e.parentNode, 'detailSlideOut', function () {
				ui.css(e, 'display', 'none');
				ui.css(e, 'marginTop', '');
				ui.css(e2, 'marginTop', '');
				ui.css(e2, 'marginLeft', '');
			});
		} else {
			e2 = e.previousElementSibling;
			if (!e2) {
				e2 = e.parentNode.lastChild;
				ui.css(e2, 'marginLeft', '-200%');
			} else
				ui.css(2, 'marginLeft', '-100%');
			ui.css(e2, 'display', 'inline-block');
			ui.navigation.animation(e.parentNode, 'detailBackSlideOut', function () {
				ui.css(e2, 'marginLeft', '');
				ui.css(e, 'display', 'none');
			});
		}
	}
	static toggle(id) {
		var d = ui.q('detail card:last-child[i="' + id + '"] [name="events"]');
		if (d) {
			if (!d.innerHTML) {
				var field = ui.q('detail card:last-child').getAttribute('type');
				communication.ajax({
					url: global.server + 'db/list?query=location_listEvent&search=' + encodeURIComponent('event.' + field + 'Id=' + id),
					responseType: 'json',
					success(r) {
						pageEvent.toggleInternal(r, id, field);
					}
				});
			} else
				details.togglePanel(ui.q('detail card:last-child[i="' + id + '"] [name="events"]'));
		}
	}
	static toggleInternal(r, id, field) {
		var e = ui.q('detail card:last-child[i="' + id + '"] [name="events"]');
		if (!e)
			return;
		var bg = ui.classContains('detail card:last-child[i="' + id + '"] [name="buttonEvents"]', 'bgBonus') ? 'bgBonus' : 'bgColor';
		var a = pageEvent.getCalendarList(r), newButton = field == 'contact' ? '' : '<br/><br/><buttontext onclick="pageEvent.edit(' + id + ')" class="' + bg + '">' + ui.l('events.new') + '</buttontext>' +
			'<buttontext class="bgColor" name="buttonMarketing" onclick="pageEvent.requestOwnerShip()">' + ui.l('locations.marketing') + '</buttontext>';
		var s = '', v, text;
		var b = user.contact.id == id;
		if (b && e.getAttribute('active'))
			b = false;
		for (var i = 1; i < a.length; i++) {
			v = a[i];
			v.bg = bg;
			var s2 = global.date.formatDate(v.event.startDate, 'weekdayLong');
			var date = global.date.getDateFields(v.event.startDate);
			date = date.year + '-' + date.month + '-' + date.day;
			var idIntern = v.event.id + '_' + date;
			s2 = global.date.getDateHint(v.event.startDate).replace('{0}', s2);
			var img;
			if (v.event.imageList || v.imageList)
				img = global.serverImg + (v.event.imageList ? v.event.imageList : v.imageList);
			else
				img = 'images/event.svg" class="' + bg;
			text = '';
			if (v.event.price > 0)
				text += global.separator + ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2));
			if (v.event.maxParticipants)
				text += global.separator + ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
			var p = pageEvent.getParticipation({ id: v.event.id, date: date });
			if (v.event.confirm == 1)
				text += global.separator + ui.l('events.participationMustBeConfirmed');
			if (text)
				text = '<br/>' + text.substring(global.separator.length);
			text += '<br/>' + v.event.text;
			if (field == 'contact')
				text = '<br/>' + v.name + text;
			s += '<row' + (p.state == 1 ? ' class="participate"' : p.state == -1 ? ' class="canceled"' : '') + ' onclick="details.open(&quot;' + idIntern + '&quot;,&quot;location_listEvent&search=' + encodeURIComponent('event.id=' + v.event.id) + '&quot;,pageLocation.detailLocationEvent)"><div><text>' + s2 + text + '</text><imageList><img src="' + img + '"/></imageList></div></row>';
		}
		if (s)
			s += newButton;
		else
			s = '<detailTogglePanel>' + ui.l('events.noEvents') + newButton + '</detailTogglePanel>';
		e.innerHTML = s;
		details.togglePanel(e);
	}
	static toggleParticipants(event, id, confirm) {
		if (event.stopPropagation)
			event.stopPropagation();
		var e = ui.q('detail card:last-child[i="' + id.id + '_' + id.date + '"] [name="participants"]');
		if (e) {
			if (e.innerHTML)
				ui.toggleHeight(e);
			else {
				communication.loadList('query=contact_listEventParticipate&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&limit=0&search=' + encodeURIComponent('eventParticipate.state=1 and eventParticipate.eventId=' + id.id + ' and eventParticipate.eventDate=\'' + id.date + '\''), function (l) {
					e.innerHTML = l.length < 2 ? '<div style="margin-bottom:1em;">' + ui.l('events.noParticipant') + '</div>' : pageContact.listContacts(l);
					ui.toggleHeight(e);
					return '&nbsp;';
				});
			}
		}
	}
}