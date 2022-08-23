import { communication } from "./communication";
import { details } from "./details";
import { global } from "./global";
import { lists } from "./lists";
import { EventParticipate, Location, model } from "./model";
import { pageContact } from "./pageContact";
import { pageLocation } from "./pageLocation";
import { formFunc, ui } from "./ui";
import { user } from "./user";

export { events };

class events {
	static participations = null;
	static templateEdit = v =>
		global.template`<form name="editElement">
<input type="hidden" name="id" value="${v.id}"/>
<input type="hidden" name="locationId" value="${v.locationID}"/>
<input type="hidden" name="confirm" />
${v.hint}
<field>
	<label>${ui.l('type')}</label>
	<value>
		<input type="radio" name="type" value="o" label="${ui.l('events.type_o')}" onclick="events.setForm()" ${v.type_o}/>
		<input type="radio" name="type" value="w1" label="${ui.l('events.type_w1')}" onclick="events.setForm()" ${v.type_w1}/>
		<input type="radio" name="type" value="w2" label="${ui.l('events.type_w2')}" onclick="events.setForm()" ${v.type_w2}/>
		<input type="radio" name="type" value="m" label="${ui.l('events.type_m')}" onclick="events.setForm()" ${v.type_m}/>
		<input type="radio" name="type" value="y" label="${ui.l('events.type_y')}" onclick="events.setForm()" ${v.type_y}/>
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
		<textarea name="text">${v.text}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('events.visibility')}</label>
	<value>
		<input type="radio" name="visibility" value="1" label="${ui.l('events.visibility1')}" ${v.visibility1}/>
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
<dialogButtons>
	<buttontext onclick="events.save()" class="bgColor">${ui.l('save')}</buttontext>
	<buttontext onclick="pageLocation.deleteElement(${v.idOrNull},&quot;Event&quot;)"
		style="margin-left:1em;" class="bgColor" id="deleteElement">${ui.l('delete')}</buttontext>
	<popupHint></popupHint>
</dialogButtons>
</form>`;
	static templateDetail = v =>
		global.template`<text class="event${v.classParticipate}" ${v.oc}>
<div>${ui.l('events.createdBy')}<br/><a class="chatLinks" onclick="ui.navigation.autoOpen(global.encParam(&quot;p=${v.event.contactId}&quot;),event)"><img src="${v.imageEventOwner}"><br>${v.contact.pseudonym}</a></div>
${v.eventLinkOpen}
<div>${v.date}${v.endDate}</div>
<div>${v.event.text}${v.eventMore}</div>
${v.eventPrice}
<div>${v.maxParticipants}${v.eventMustBeConfirmed}</div>
<span id="eventParticipants"></span>
${v.eventLinkClose}
<div style="margin-top:1em;">${v.eventParticipationButtons}</div>
</text>`;

	static detail(v) {
		v.copyLinkHint = ui.l('copyLinkHint.event');
		if (v.event.contactId != user.contact.id)
			v.hideMeEdit = ' noDisp';
		if (v.event.type != 'o') {
			var s = global.date.formatDate(v.event.endDate);
			v.endDate = ' (' + ui.l('events.type_' + v.event.type) + ' ' + ui.l('to') + ' ' + s.substring(s.indexOf(' ') + 1, s.lastIndexOf(' ')) + ')';
		}
		if (('' + v.id).indexOf('_') < 0) {
			v.date = global.date.formatDate(v.event.startDate);
			v.date = '<eventOutdated>&nbsp;' + v.date;
			v[v.endDate ? 'endDate' : 'date'] += '&nbsp;</eventOutdated>';
		} else {
			var x = { id: v.id.split('_')[0], date: v.id.split('_')[1] };
			var d = global.date.getDateFilelds(x.date);
			var d2 = global.date.getDateFilelds(v.event.startDate);
			d.hour = d2.hour;
			d.minute = d2.minute;
			v.date = global.date.formatDate(d);
			v.eventParticipationButtons = events.getParticipateButton(x, v);
			if (events.getParticipation(x).state == 1)
				v.classParticipate = ' participate';
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
		if (v.event.confirm == 1) {
			v.eventMustBeConfirmed = '<br/>' + ui.l('events.participationMustBeConfirmed');
			if (p.state == 1)
				v.eventMustBeConfirmed = v.eventMustBeConfirmed + '<br/>' + ui.l('events.confirmed');
			else if (p.state == -1)
				v.eventMustBeConfirmed = v.eventMustBeConfirmed + '<br/>' + ui.l('events.canceled');
		}
		if (v.contact.imageList)
			v.imageEventOwner = global.serverImg + v.contact.imageList;
		else
			v.imageEventOwner = 'images/contact.svg" style="padding:1em;';
		v.hideMeFavorite = ' noDisp';
		v.hideMeEvents = ' noDisp';
		v.hideMeMarketing = ' noDisp';
		v.editAction = 'events.edit(' + v.locID + ',' + v.event.id + ')';
		return events.templateDetail(v);
	}
	static edit(locationID, id) {
		if (id)
			events.editInternal(locationID, id, pageLocation.currentDetail);
		else
			events.editInternal(locationID);
	}
	static editInternal(locationID, id, v) {
		var draft = formFunc.getDraft('event' + locationID + (id ? '_' + id : ''));
		if (draft)
			v = draft.values;
		else if (v)
			v = model.convert(new Location(), v).event;
		else
			v = {};
		if (v.startDate && v.startDate.indexOf(':') > -1) {
			v.startDate = v.startDate.substring(0, v.startDate.lastIndexOf('.'));
			v.startDate = v.startDate.substring(0, v.startDate.lastIndexOf(':'));
		}
		if (v.endDate)
			v.endDate = v.endDate;
		v.idOrNull = id ? id : 'null';
		var d = new Date();
		v.today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
		v.id = id;
		if (!id)
			v.hint = '<div style="margin-bottom:2em;">' + ui.l('events.newHint') + '</div>';
		v.locationID = locationID;
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
			var d = new Date();
			d.setDate(d.getDate() + 1);
			v.startDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + 'T' + ('0' + d.getHours()).slice(-2) + ':00';
		}
		if (!v.endDate) {
			var d = new Date();
			d.setMonth(d.getMonth() + 6);
			v.endDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
		}
		ui.navigation.openPopup(v.name, events.templateEdit(v), 'events.saveDraft()');
		events.setForm();
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
						s = events.getParticipation({ id: v.event.id, date: d1.getFullYear() + '-' + ('0' + (d1.getMonth() + 1)).slice(-2) + '-' + ('0' + d1.getDate()).slice(-2) });
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
	static getParticipateButton(p, v) {
		var participation = events.getParticipation(p);
		var text = '';
		if (participation.state == 1 || participation.state == null || !v.event.confirm)
			text += '<buttontext pID="' + (participation.id ? participation.id : '') + '" s="' + (participation.id ? participation.state : '') + '" confirm="' + v.event.confirm + '" class="bgColor" onclick="events.participate(event,' + JSON.stringify(p).replace(/"/g, '&quot;') + ')" max="' + (v.maxParticipants ? v.maxParticipants : 0) + '">' + ui.l('events.participante' + (participation.state == 1 ? 'Stop' : '')) + '</buttontext>';
		if (v.CP && v.CP.length > 1)
			text += '<buttontext class="bgColor" onclick="events.toggleParticipants(event,' + JSON.stringify(p) + ',' + v.event.confirm + ')">' + ui.l('events.participants') + '</buttontext>';
		return text;
	}
	static getParticipation(p) {
		if (events.participations) {
			for (var i = 0; i < events.participations.length; i++) {
				if (events.participations[i].eventId == p.id && events.participations[i].eventDate == p.date)
					return events.participations[i];
			}
		}
		return {};
	}
	static init() {
		communication.ajax({
			url: global.server + 'db/list?query=event_participate&search=' + encodeURIComponent('eventParticipate.contactId=' + user.contact.id),
			responseType: 'json',
			success(r) {
				events.participations = [];
				for (var i = 1; i < r.length; i++)
					events.participations.push(model.convert(new EventParticipate(), r, i));
			}
		});
	}
	static listEvents(l) {
		var activeID = ui.navigation.getActiveID()
		if (activeID == 'search')
			ui.attr('search', 'type', 'events');
		var as = events.getCalendarList(l);
		lists.data[activeID] = as;
		return events.listEventsInternal(as);
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
		var bg = 'bgColor';
		for (var i = 1; i < as.length; i++) {
			if (as[i] == 'outdated') {
				if (date)
					break;
				outdated = true;
				s += '<eventListTitle style="margin-top:2em;">' + ui.l('events.outdated') + '</eventListTitle>';
			} else {
				v = as[i];
				var startDate = global.date.server2Local(v.event.startDate);
				var s2 = global.date.formatDate(startDate, 'weekdayLong');
				var s3 = s2.substring(0, s2.lastIndexOf(' '));
				if (!date || s3 == dateString) {
					if (s3 != current) {
						current = s3;
						if (!outdated && !date)
							s += '<eventListTitle>' + global.date.getDateHint(startDate).replace('{0}', s3) + '</eventListTitle>';
					}
					var t = global.date.formatDate(startDate);
					t = t.substring(t.lastIndexOf(' ') + 1);
					v.name = t + ' ' + v.name;
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
						var d = global.date.getDateFilelds(v.event.startDate);
						if (events.getParticipation({ id: v.id, date: d.year + '-' + d.month + '-' + d.day }).state == 1)
							v.classFavorite += ' participate';
						v.id += '_' + d.year + '-' + d.month + '-' + d.day;
					}
					v.classBGImg = v.imageList ? '' : bg;
					v.image = v.event.imageList ? global.serverImg + v.event.imageList : v.imageList ? global.serverImg + v.imageList : 'images/event.svg" style="padding: 1em; ';
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
					v._geolocationDistance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 10 ? 0 : 1).replace('.', ',') : '';
					v.type = 'Event';
					v.render = 'pageLocation.detailLocationEvent';
					v.query = 'event_list&search=' + encodeURIComponent('event.id=' + v.event.id);
					s += pageLocation.templateList(v);
				}
			}
		}
		return s;
	}
	static listEventsMy(l) {
		var as = events.getCalendarList(l, true);
		lists.data[ui.navigation.getActiveID()] = as;
		return events.listEventsInternal(as);
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
				var s = ui.q('#stopParticipateReason').val;
				if (!s) {
					events.stopParticipate(id);
					return;
				}
				if (s.trim().length == 0)
					return;
				d.values.reason = s;
			}
		} else {
			id.d = global.date.getDateFilelds(id.date);
			d.values.state = 1;
			d.values.eventId = id.id;
			d.values.eventDate = id.d.year + '-' + id.d.month + '-' + id.d.day;
		}
		communication.ajax({
			url: global.server + 'db/one',
			method: participateID ? 'PUT' : 'POST',
			body: d,
			success(r) {
				if (r)
					ui.attr(button, 'pID', r);
				if (button.getAttribute('s') == '1') {
					if (button.getAttribute('confirm') == '1')
						button.parentNode.innerHTML = '';
					else {
						ui.attr(button, 's', '-1');
						button.innerText = ui.l('events.participante');
						ui.classRemove('detail card:last-child .event', 'participate');
						ui.classRemove('row[i="' + id.id + '_' + id.date + '"]', 'participate');
					}
				} else {
					ui.attr(button, 's', '1');
					button.innerText = ui.l('events.participanteStop');
					ui.classAdd('detail card:last-child .event', 'participate');
					ui.classAdd('row[i="' + id.id + '_' + id.date + '"]', 'participate');
				}
				ui.navigation.hidePopup();
				events.init();
			}
		});
	}
	static refreshToggle() {
		var e = ui.q('detail card:last-child [name="events"]');
		if (e) {
			var id = ui.q('detail card:last-child').getAttribute('i');
			ui.toggleHeight(e, function () {
				e.innerHTML = '';
				events.toggle(id);
			});
		}
	}
	static save() {
		var d1, d2;
		var start = ui.q('input[name="startDate"]');
		var end = ui.q('input[name="endDate"]');
		var text = ui.q('[name="text"]');
		var id = ui.q('[name="id"]').value;
		ui.html('popupHint', '');
		formFunc.resetError(start);
		formFunc.resetError(end);
		formFunc.resetError(text);
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
		if (!ui.q('[name="type"]').checked) {
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
		if (ui.q('popup errorHint'))
			return;
		if (ui.q('[name="type"]').checked)
			end.value = start.value.substring(0, start.value.lastIndexOf('T'));
		ui.q('[name="confirm"]').value = ui.q('[name="eventconfirm"]:checked') ? 1 : 0;
		var v = formFunc.getForm('editElement');
		v.values.startDate = global.date.local2server(v.values.startDate);
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
				events.refreshToggle();
			}
		});
	}
	static saveDraft() {
		var s = ui.q('detail card:last-child').getAttribute('i');
		if (s && s.indexOf('_') > 0)
			s = '_' + s.substring(0, s.indexOf('_'));
		else
			s = '';
		formFunc.saveDraft('event' + ui.q('[name="locationId"]').value + s, formFunc.getForm('editElement'));
	}
	static setForm() {
		var b = ui.q('[name="type"]').checked;
		ui.q('label[name="startDate"]').innerText = ui.l('events.' + (b ? 'date' : 'start'));
		ui.css('field[name="endDate"]', 'display', b ? 'none' : '');
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
	static stopParticipate(id) {
		var e = ui.q('[name="button_' + id + '"]');
		ui.navigation.openPopup(ui.l('events.stopParticipate'), ui.l('events.stopParticipateText') + '<br/><textarea id="stopParticipateReason" placeholder="' + ui.l('events.stopParticipateHint') + '" style="margin-top:0.5em;"></textarea><buttontext class="bgColor" style="margin-top:1em;" pID="' + e.getAttribute('pID') + '" s="' + e.getAttribute('s') + '" confirm="' + e.getAttribute('confirm') + '" onclick="events.participate(event,&quot;' + id + '&quot;)">' + ui.l('events.stopParticipateButton') + '</buttontext>');
	}
	static toggle(id) {
		var d = ui.q('detail card:last-child[i="' + id + '"] [name="events"]');
		if (!d.innerHTML) {
			var field = ui.q('detail card:last-child').getAttribute('type');
			communication.ajax({
				url: global.server + 'db/list?query=event_list&search=' + encodeURIComponent('event.' + field + 'Id=' + id),
				responseType: 'json',
				success(r) {
					events.toggleInternal(r, id, field);
				}
			});
		} else
			details.togglePanel(ui.q('detail card:last-child[i="' + id + '"] [name="events"]'));
	}
	static toggleInternal(r, id, field) {
		var bg = ui.classContains('detail card:last-child[i="' + id + '"] [name="buttonEvents"]', 'bgBonus') ? 'bgBonus' : 'bgColor';
		var a = events.getCalendarList(r), newButton = field == 'contact' ? '' : '<br/><br/><buttontext onclick="events.edit(' + id + ')" class="' + bg + '">' + ui.l('events.new') + '</buttontext>';
		var s = '', v, text;
		var b = user.contact.id == id;
		if (b && ui.q('detail card:last-child[i="' + id + '"] [name="events"]').getAttribute('active'))
			b = false;
		for (var i = 1; i < a.length; i++) {
			v = a[i];
			v.bg = bg;
			var s2 = global.date.formatDate(v.event.startDate, 'weekdayLong');
			var date = global.date.getDateFilelds(v.event.startDate);
			date = date.year + '-' + date.month + '-' + date.day;
			var idIntern = v.event.id + '_' + date;
			s2 = global.date.getDateHint(v.event.startDate).replace('{0}', s2);
			var img;
			if (v.event.imageList || v.imageList)
				img = global.serverImg + (v.event.imageList ? v.event.imageList : v.imageList);
			else
				img = 'images/event.svg" class="' + bg;
			s2 = '<img src="' + img + '"/>' + s2;
			text = '';
			if (v.event.price > 0)
				text += global.separator + ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2));
			if (v.event.maxParticipants)
				text += global.separator + ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
			var p = events.getParticipation({ id: v.event.id, date: date });
			if (v.event.confirm == 1) {
				text += global.separator + ui.l('events.participationMustBeConfirmed');
				if (p.state == 1)
					text += global.separator + ui.l('events.confirmed');
				else if (p.state == 0)
					text += global.separator + ui.l('events.canceled');
			}
			if (text)
				text = '<br/>' + text.substring(global.separator.length);
			text += '<br/>' + v.event.text;
			if (field == 'contact')
				text = '<br/>' + v.name + text;
			s += '<auxEvents' + (p.state == 1 ? ' class="participate"' : '') + ' onclick="details.open(&quot;' + idIntern + '&quot;,&quot;event_list&search=' + encodeURIComponent('event.id=' + v.event.id) + '&quot;,pageLocation.detailLocationEvent)">' + s2 + text + '</auxEvents>';
		}
		if (s)
			s += newButton;
		else
			s = '<detailTogglePanel>' + ui.l('events.noEvents') + newButton + '</detailTogglePanel>';
		var e = ui.q('detail card:last-child[i="' + id + '"] [name="events"]');
		e.innerHTML = s;
		details.togglePanel(e);
	}
	static toggleParticipants(event, id, confirm) {
		if (event.stopPropagation)
			event.stopPropagation();
		var d = id.substring(id.lastIndexOf('_') + 1), i = id.substring(id.indexOf('_') + 1, id.lastIndexOf('_'));
		var e = ui.q('detail card:last-child[i="' + id + '"] [name="participants"]');
		if (e.innerHTML)
			details.togglePanel(e);
		else {
			communication.loadList('query=event_list&search=' + encodeURIComponent('eventParticipate.state=1 and eventParticipate.eventId=' + i + ' and eventParticipate.eventDate=\'' + d + '\''), function (l) {
				e.innerHTML = l.length < 2 ? '<div style="margin-bottom:1em;">' + ui.l('events.no' + (confirm == 1 ? 'Participant' : 'Marks')) + '</div>' : '<div style="padding:0;margin:0;"><div style="margin-bottom:1em;">' + ui.l('events.participants') + '</div>' + pageContact.listContactsInternal(l) + '</div>';
				details.togglePanel(e);
				return '&nbsp;';
			});
		}
	}
}