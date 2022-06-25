import { communication } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { Location, model, LocationOpenTime, EventParticipate } from './model';
import { pageChat } from './pageChat';
import { pageContact } from './pageContact';
import { pageWhatToDo } from './pageWhatToDo';
import { ui, formFunc } from './ui';
import { user } from './user';

export { pageLocation };

class pageLocation {
	static currentDetail;
	static locationsAdded = null;
	static map = {
		canvas: null,
		id: null,
		markerLocation: null,
		markerMe: null,
		scrollTop: -1,
		svgLocation: null,
		svgMe: null,
		timeout: null
	};
	static templateList = v =>
		global.template`<row onclick="details.open(&quot;${v.id}&quot;,&quot;${v.query}&quot;,${v.render});" i="${v.id}" class="location${v.classFavorite}">
			${v.present}
	<div>
		<div>
			<text class="${v.classParticipate}">
				<title>${v.name}</title>
				${v._message}<matchIndicator>${v.matchIndicator}</matchIndicator>
			</text>
		</div>
		<imagelist>
			<img src="${v.image}" class="${v.classBGImg}" />
		</imagelist>
	</div>
</row>`;
	static templateDetail = v =>
		global.template`<detailHeader>
	<detailImg>
		<img src="${v.image}" />
		<detailTitle>
			<title>${v.name}</title>
		</detailTitle>
	</detailImg>
	<action>
		<buttonIcon onclick="pageChat.open(${v.id},true)"><img src="images/chat.svg"/></buttonIcon>
		<buttonIcon class="iconFavorite${v.favorite}" idFav="${v.locationFavorite.id ? v.locationFavorite.id : ''}" fav="${v.locationFavorite.favorite ? true : ''}" name="buttonFavorite" onclick="pageLocation.toggleFavorite(${v.id})"><img source="favorite.svg" /></buttonIcon>
		<matchIndicator${v.matchIndicatorClass}>
			<svg viewBox="0 0 36 36">
				<path class="circle-bg" d="M18 2.0845
					a 15.9155 15.9155 0 0 1 0 31.831
					a 15.9155 15.9155 0 0 1 0 -31.831"></path>
				<path class="circle" stroke-dasharray="${v.matchIndicatorPercent}, 100" d="M18 2.0845
					a 15.9155 15.9155 0 0 1 0 31.831
					a 15.9155 15.9155 0 0 1 0 -31.831"></path>
				<text x="18" y="21.35" class="percentage">${v.matchIndicator}</text>
			</svg>
		</matchIndicator>
		<detailCompass>
			<span a="${v.angle}" style="transform:rotate(${v.angle}deg);">&uarr;</span>
			<km>${v.distance}</km>
		</detailCompass>
	</action>
</detailHeader>
<text>
	${v.telOpenTag}${v.address}<br/>${v.tel}${v.telCloseTag}
</text>
${v.eventDetails}
${v.description}
<text>
	${v.bonus}
	${v.attributes}
	${v.budget}
	${v.rating}
	${v.parking}
	<openTimes></openTimes>
	<div>${v.openTimesBankholiday}</div>
	<div>${v.openTimesText}</div>
</text>
<img class="map" i="${v.id}"
	onclick="ui.navigation.openHTML(&quot;https://maps.google.com/maps/dir/${geoData.latlon.lat},${geoData.latlon.lon}/${v.latitude},${v.longitude}&quot;)" />
<detailButtons>
	<buttontext class="bgColor${v.pressedCopyButton}" name="buttonCopy"
		onclick="pageChat.doCopyLink(event,&quot;${v.isEvent ? 'e' : 'l'}=${v.id}&quot;)">${ui.l('share')}</buttontext>
	<buttontext class="bgColor${v.hideMeEvents}" name="buttonEvents"
		onclick="pageLocation.event.toggle(${v.locID})">${ui.l('events.title')}</buttontext>
	<buttontext class="bgColor" name="buttonWhatToDo"
		onclick="pageLocation.toggleWhatToDo(${v.id})">${ui.l('wtd.location')}</buttontext>
	<buttontext class="bgColor${v.hideMeMarketing}" name="buttonMarketing"
		onclick="ui.navigation.openHTML(&quot;${global.server}locOwner?id=${v.id}&quot;,&quot;locOwn&quot;)">${ui.l('locations.marketing')}</buttontext>
	<buttontext class="bgColor${v.hideMeEdit}" name="buttonEdit"
		onclick="pageLocation.event.edit(${v.locID},${v.event.id ? v.event.id : 'null'},${v.isEvent})">${ui.l('edit')}</buttontext>
	<buttontext class="bgColor" name="buttonGoogle"
		onclick="ui.navigation.openHTML(&quot;https://google.com/search?q=${encodeURIComponent(v.name + ' ' + v.town)}&quot;)">Google</buttontext>
</detailButtons>
<text name="events" class="collapsed" ${v.urlNotActive}></text>
<text name="whatToDo" class="collapsed">
	<detailTogglePanel>
		<div style="margin-bottom:1.5em;">${ui.l('wtd.time')}<br/>
			<input type="time" id="messageTimeDetail" placeholder="HH:MM" class="whatToDoTime" value="${v.wtdTime}" />
		</div>
		<buttontext class="bgColor"
			onclick="pageWhatToDo.saveLocation(&quot;${v.cat}&quot;,${v.locID})">
			${ui.l('wtd.buttonSave')}
		</buttontext>
	</detailTogglePanel>
</text>
<text name="copy" class="collapsed">
	<detailTogglePanel>
		${v.copyLinkHint}<br />
		<buttontext onclick="pageInfo.socialShare(global.encParam(&quot;l=${v.id}&quot;))"
			style="margin-top:2em;${v.displaySocialShare}" class="bgColor">
			${ui.l('sendSocialShareLocation')}
		</buttontext>
	</detailTogglePanel>
</text>
<text name="marketing" class="collapsed">
	<detailTogglePanel></detailTogglePanel>
</text>
<text name="participants" class="collapsed" style="padding:1em 0.5em 0 0.5em;"></text>`;
	static templateDetailEvent = v =>
		global.template`<text class="borderBottom${v.classParticipate}" ${v.oc}>
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
	static templateEdit = v =>
		global.template`<form name="editElement">
<input type="hidden" name="id" transient="true" value="${v.id}" />
<input type="hidden" name="latitude" value="${v.latitude}" />
<input type="hidden" name="longitude" value="${v.longitude}" />
<input type="hidden" name="town" />
<input type="hidden" name="street" />
<input type="hidden" name="zipCode" />
<input type="hidden" name="country" />
<input type="hidden" name="address2" />
<input type="hidden" name="parkingOption" />
<input type="hidden" name="category" />
<input type="hidden" name="budget" />
<input type="hidden" name="openTimesBankholiday" />
<input type="hidden" name="attr0" />
<input type="hidden" name="attr1" />
<input type="hidden" name="attr2" />
<input type="hidden" name="attr3" />
<input type="hidden" name="attr4" />
<input type="hidden" name="attr5" />
${v.hint}
<field>
	<label>${ui.l('name')}</label>
	<value>
		<input type="text" name="name" maxlength="100" value="${v.name}" />
		<locationNameInputHelper style="display:none;"></locationNameInputHelper>
	</value>
</field>
<field>
	<label>${ui.l('description')}</label>
	<value>
		<textarea name="description">${v.description}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('locations.address')}</label>
	<value>
		<textarea name="address" maxlength="250">${v.address}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('locations.telephone')}</label>
	<value>
		<input type="tel" name="telephone" maxlength="20" value="${v.telephone}"}/>
	</value>
</field>
<field>
	<label>${ui.l('picture')}</label>
	<value>
		<input type="file" name="image" accept=".gif, .png, .jpg" />
	</value>
</field>
<field style="margin-bottom:0;">
	<label>${ui.l('priceCategory')}</label>
	<value>
		<input type="checkbox" value="0" name="locationbudget" transient="true" label="${ui.l('budget')}" ${v.budget0}/>
		<input type="checkbox" value="1" name="locationbudget" transient="true" label="${ui.l('budget')}${ui.l('budget')}" ${v.budget1}/>
		<input type="checkbox" value="2" name="locationbudget" transient="true" label="${ui.l('budget')}${ui.l('budget')}${ui.l('budget')}" ${v.budget2}/>
	</value>
</field>
<field>
	<label>${ui.l('locations.parking')}</label>
	<value>
		<input type="checkbox" style="width:100%;" name="parkingOption2" transient="true" value="1" label="${ui.l('locations.parking1')}"${v.parkCheck1}/><br />
		<input type="checkbox" style="width:100%;" name="parkingOption2" transient="true" value="2" label="${ui.l('locations.parking2')}"${v.parkCheck2}/><br />
		<input type="checkbox" style="width:100%;" name="parkingOption2" transient="true" value="3" label="${ui.l('locations.parking3')}"${v.parkCheck3}/><br />
		<input type="checkbox" style="width:100%;" name="parkingOption2" transient="true" value="4" label="${ui.l('locations.parking4')}"${v.parkCheck4}/><br />
		<input type="text" name="parkingText" maxlength="100" placeholder="${ui.l('locations.shortDescParking')}" value="${v.parkingText}" style="float: left;" />
	</value>
</field>
<field>
	<label>${ui.l('category')}</label>
	<value style="text-align:center;">
		<input type="checkbox" name="locationcategory" transient="true" value="0" onclick="pageLocation.setEditAttributes()" label="${ui.categories[0].label}" ${v.cat0}/>
		<input type="checkbox" name="locationcategory" transient="true" value="1" onclick="pageLocation.setEditAttributes()" label="${ui.categories[1].label}" ${v.cat1}/>
		<input type="checkbox" name="locationcategory" transient="true" value="2" onclick="pageLocation.setEditAttributes()" label="${ui.categories[2].label}" ${v.cat2}/>
		<input type="checkbox" name="locationcategory" transient="true" value="3" onclick="pageLocation.setEditAttributes()" label="${ui.categories[3].label}" ${v.cat3}/>
		<input type="checkbox" name="locationcategory" transient="true" value="4" onclick="pageLocation.setEditAttributes()" label="${ui.categories[4].label}" ${v.cat4}/>
		<input type="checkbox" name="locationcategory" transient="true" value="5" onclick="pageLocation.setEditAttributes()" label="${ui.categories[5].label}" ${v.cat5}/>
	</value>
</field>
<field>
	<label>${ui.l('locations.subCategories')}</label>
	<value style="text-align:center;" id="loc_attrib" v0="${v.attr0}" v1="${v.attr1}" v2="${v.attr2}"
		v3="${v.attr3}" v4="${v.attr4}" v5="${v.attr5}" v6="${v.attr6}">
	</value>
</field>
<field ${v.hideOpenTimes}>
	<label>
		${ui.l('locations.opentimes')}
	</label>
	<value>
		<openTimesEdit>
			${v.ot}
		</openTimesEdit>
		<div><openTimesAdd class="bgColor" onclick="pageLocation.addOpenTimeRow()">+</openTimesAdd></div>
		<input type="checkbox" style="width:100%;" name="openTimesBankholiday2" transient="true" value="1" label="${ui.l('locations.closedOnBankHoliday')}" ${v.bankHolidayCheck}/><br />
		<input type="text" name="openTimesText" maxlength="100" placeholder="${ui.l('locations.shortDescOpenTimes')}" value="${v.openTimesText}" style="float: left;" />
	</value>
</field>
<dialogButtons>
	<buttontext onclick="pageLocation.save()" class="bgColor">
		${ui.l('save')}
	</buttontext>
	${v.deleteButton}
	<popupHint></popupHint>
</dialogButtons>
</form> `;
	static templateEditEvent = v =>
		global.template`<form name="editElement">
<input type="hidden" name="id" value="${v.id}"/>
<input type="hidden" name="locationId" value="${v.locationID}"/>
<input type="hidden" name="confirm" />
${v.hint}
<field>
	<label>${ui.l('type')}</label>
	<value>
		<input type="radio" name="type" value="o" label="${ui.l('events.type_o')}" onclick="pageLocation.event.setForm()" ${v.type_o}/>
		<input type="radio" name="type" value="w1" label="${ui.l('events.type_w1')}" onclick="pageLocation.event.setForm()" ${v.type_w1}/>
		<input type="radio" name="type" value="w2" label="${ui.l('events.type_w2')}" onclick="pageLocation.event.setForm()" ${v.type_w2}/>
		<input type="radio" name="type" value="m" label="${ui.l('events.type_m')}" onclick="pageLocation.event.setForm()" ${v.type_m}/>
		<input type="radio" name="type" value="y" label="${ui.l('events.type_y')}" onclick="pageLocation.event.setForm()" ${v.type_y}/>
	</value>
</field>
<field>
	<label name="startDate">${ui.l('events.start')}</label>
	<value>
		<input type="datetime-local" name="startDate" placeholder="TT.MM.JJJJ HH:MM" value="${v.startDate}" step="900" min="${v.today}T00:00:00" />
	</value>
</field>
<field>
	<label name="endDate">${ui.l('events.end')}</label>
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
	<buttontext onclick="pageLocation.event.save()" class="bgColor">${ui.l('save')}</buttontext>
	<buttontext onclick="pageLocation.deleteElement(${v.idOrNull},&quot;Event&quot;)"
		style="margin-left:1em;" class="bgColor" id="deleteElement">${ui.l('delete')}</buttontext>
	<popupHint></popupHint>
</dialogButtons>
</form>`;
	static templateEditMarketing = v =>
		global.template`${ui.l('locations.marketing1')}
				<br />
<buttontext onclick="this.style.display=&quot;none&quot;;this.nextSibling.style.display=&quot;&quot;"
	class="bgColor" style="margin: 1em;">
	${ui.l('locations.marketingMore1')}
</buttontext>
<div style="display:none;margin-top:1em;">
	<span onclick="openHTML(&quot;${global.server}agbB2B&quot;)">${ui.l('locations.marketing2')}
		<br /><br /></span>
	<field>
		<label>
			${ui.l('locations.marketingTaxNo')}
		</label>
		<value>
			<input type="text" id="taxNo" maxlength="20" />
		</value>
	</field>
	<field>
		<label>
			${ui.l('info.legalTitle')}
		</label>
		<value>
			<input id="agb" type="checkbox" label="${ui.l('login.legal')}" style="width:100%;margin-bottom:0;" />
		</value>
	</field>
	<field>
		<label>Dauer</label>
		<value>
			<input type="radio" value="30 Tage" label="30 Tage:&nbsp;40,00€" name="os0" checked="checked" />
			<input type="radio" value="60 Tage" label="60 Tage:&nbsp;65,00€" name="os0" />
			<input type="radio" value="90 Tage" label="90 Tage:&nbsp;90,00€" name="os0" />
		</value>
	</field>
	<buttontext class="bgColor" onclick="pageLocation.setOwner(${v.id})">
	${ui.l('locations.marketingConfirmTest')}
	</buttontext>
	<buttontext class="bgColor" style="margin-top:1em;"
					onclick="ui.navigation.openHTML(&quot;${global.server}agbB2B?scale=${v.scale}&quot;)">
	${ui.l('info.legalTitle')}
	</buttontext>
</div>`;
	static templateEditOpenTimes = v =>
		global.template`<select name="openTimes.day${v.i}">
	<option value="1"${v.wd1}>${ui.l('weekday1')}</option>
	<option value="2"${v.wd2}>${ui.l('weekday2')}</option>
	<option value="3"${v.wd3}>${ui.l('weekday3')}</option>
	<option value="4"${v.wd4}>${ui.l('weekday4')}</option>
	<option value="5"${v.wd5}>${ui.l('weekday5')}</option>
	<option value="6"${v.wd6}>${ui.l('weekday6')}</option>
	<option value="0"${v.wd0}>${ui.l('weekday0')}</option>
	<option value="x">${ui.l('delete')}</option>
</select>
<span>${ui.l('from')}</span>
<input type="time" placeholder="HH:MM" value="${v.openAt}"
	name="openTimes.openAt${v.i}" onblur="pageLocation.prefillOpenTimesFields(event,&quot;open&quot;);" />
<span>${ui.l('to')}</span>
<input type="time" placeholder="HH:MM" value="${v.closeAt}"
	name="openTimes.closeAt${v.i}" onblur="pageLocation.prefillOpenTimesFields(event,&quot;close&quot;);" />
<input type="hidden" value="${v.id}" name="openTimes.id${v.i}" />`;
	static addOpenTimeRow() {
		var v = {};
		v.i = ui.qa('openTimesEdit select').length;
		if (v.i > 0)
			v['wd' + ((parseInt(ui.q('[name="openTimes.day' + (v.i - 1) + '"]').value, 10) + 1) % 7)] = ' selected';
		var e2 = document.createElement('div');
		e2.innerHTML = pageLocation.templateEditOpenTimes(v);
		ui.q('openTimesEdit').insertBefore(e2, null);
	}
	static closeLocationInputHelper() {
		var e = ui.q('locationNameInputHelper');
		if (e.innerHTML)
			ui.toggleHeight(e);
	}
	static deleteElement(id, classname) {
		if (ui.q('#deleteElement').innerHTML.indexOf(' ') > 0) {
			if (!id) {
				ui.navigation.hidePopup();
				return;
			}
			communication.ajax({
				url: global.server + 'db/one',
				method: 'DELETE',
				body: { classname: classname, id: id },
				success(r) {
					ui.navigation.hidePopup();
					if (classname == 'Location') {
						ui.navigation.goTo('locations');
						ui.q('#dl_' + id).outerHTML = '';
						setTimeout(function () {
							lists.removeListEntry(id);
						}, 700);
					} else
						pageLocation.event.refreshToggle();
				}
			});
		} else
			ui.html('#deleteElement', ui.l('delete.confirm'));
	}
	static detailLocationEvent(l, id) {
		if (l._openTimesEntries && user.contact)
			communication.ajax({
				url: global.server + 'db/list?query=location_listOpenTime&search=' + encodeURIComponent('locationOpenTime.locationId=' + l['location.id']),
				responseType: 'json',
				success(s) {
					while (model.convert(new LocationOpenTime(), s, 1).day == 0)
						s.push(s.splice(1, 1)[0]);
					l.OT = s;
					ui.html('detail[i="' + id + '"] openTimes', pageLocation.getOpenTimes(s));
				}
			});
		return pageLocation.detailLocationEventInternal(l, id);
	}
	static detailLocationEventInternal(l, id) {
		pageLocation.currentDetail = l;
		var v = model.convert(new Location(), l);
		v.isEvent = l['event.id'];
		l = l[1];
		v.parking = '';
		var p = v.parkingOption;
		if (p && p.indexOf('1') > -1)
			v.parking = global.separator + ui.l('locations.parking1');
		if (p && p.indexOf('2') > -1)
			v.parking += global.separator + ui.l('locations.parking2');
		if (p && p.indexOf('3') > -1)
			v.parking += global.separator + ui.l('locations.parking3');
		if (p && p.indexOf('4') > -1)
			v.parking += global.separator + ui.l('locations.parking4');
		if (v.parkingText)
			v.parking += global.separator + v.parkingText;
		if (v.parking)
			v.parking = '<div>' + v.parking.substring(global.separator.length) + '</div>';
		v.id = id;
		v.distance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 10 ? 0 : 1).replace('.', ',') : '';
		v.classBGImg = '';
		if (v.classBGImg.length < 8)
			v.classBGImg = 'class="bgColor"';
		v.locID = v.isEvent ? v.event.locationId : id;
		v.angle = geoData.getAngel(geoData.latlon, { lat: v.latitude, lon: v.longitude });
		v.image = v.event.image ? v.event.image : v.image;
		if (v.image)
			v.image = global.serverImg + v.image;
		else
			v.image = (v.isEvent ? 'images/event.svg' : 'images/location.svg') + '" class="bgColor" style="padding:3em;';
		v.tel = v.telephone ? v.telephone.trim() : '';
		if (v.tel) {
			v.telOpenTag = '<a href="tel:' + v.tel.replace(/[^+\d]*/g, '') + '" style="color:black;">';
			v.telCloseTag = '</a>';
		}
		v.attr = ui.getAttributes(v, 'detail');
		v.budget = v.attr.budget;
		if (v.attr.totalMatch) {
			v.matchIndicator = v.attr.totalMatch + '/' + v.attr.total;
			v.matchIndicatorPercent = parseInt(v.attr.totalMatch / v.attr.total * 100 + 0.5);
		} else
			v.matchIndicatorClass = ' class="noDisp"';
		v.attributes = v.attr.text;
		if (v.rating > 0)
			v.rating = '<detailRating onclick="rating.open(' + v.locID + ',&quot;location&quot;,event)"><ratingSelection><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v.rating) + '%;">★★★★★</full></ratingSelection></detailRating>';
		else
			v.rating = '<div style="margin:1em 0;"><buttonText class="bgColor" onclick="rating.open(' + v.locID + ',&quot;location&quot;,event)">' + ui.l('rating.save') + '</buttonText></div>';
		v.address = v.address.replace(/\n/g, '<br />');
		if (v.ownerId && v.url)
			v.description = (v.description ? v.description + ' ' : '') + ui.l('locations.clickForMoreDetails');
		if (v.description)
			v.description = '<text style="margin:1em 0;" class="highlight">' + v.description + '</text>';
		if (ui.q('locations').innerHTML) {
			if (!details.getNextNavElement(true, id))
				v.hideNext = 'display:none;';
			if (!details.getNextNavElement(false, id))
				v.hidePrevious = 'display:none;';
		}
		if (v.bonus)
			v.bonus = '<div class="highlight">' + ui.l('locations.bonus') + v.bonus + '<br/>' + ui.l('locations.bonusHint') + '</div>';
		if (v.isEvent) {
			v.copyLinkHint = ui.l('copyLinkHint.event');
			if (v.event.contactId != user.contact.id)
				v.hideMeEdit = ' noDisp';
			if (v.event.type != 'o') {
				var s = global.date.formatDate(v.event.endDate);
				v.endDate = ' (' + ui.l('events.type_' + v.event.type) + ' ' + ui.l('to') + ' ' + s.substring(s.indexOf(' ') + 1, s.lastIndexOf(' ')) + ')';
			}
			if (('' + id).indexOf('_') < 0) {
				v.date = global.date.formatDate(v.event.startDate);
				v.date = '<eventOutdated>&nbsp;' + v.date;
				v[v.endDate ? 'endDate' : 'date'] += '&nbsp;</eventOutdated>';
			} else {
				var d = global.date.formatDate(global.date.getDate(v.event.startDate));
				v.date = global.date.formatDate(('' + id).split('_')[1]);
				v.date = v.date.substring(0, v.date.lastIndexOf(' '));
				v.date = v.date + d.substring(d.lastIndexOf(' '));
				v.eventParticipationButtons = pageLocation.event.getParticipateButton({ id: v.id, date: v.date }, v);
				if (pageLocation.event.getParticipation({ id: v.id, date: v.date }).state == 1)
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
			v.eventDetails = pageLocation.templateDetailEvent(v);
			v.hideMeFavorite = ' noDisp';
			v.hideMeEvents = ' noDisp';
			v.hideMeMarketing = ' noDisp';
		} else {
			v.favorite = v.locationFavorite.favorite ? ' favorite' : '';
			if (global.isBrowser())
				v.copyLinkHint = ui.l('copyLinkHint.location');
			else
				v.copyLinkHint = ui.l('copyLinkHint.locationSocial');
			if (!user.contact || v.ownerId && v.ownerId != user.contact.id)
				v.hideMeEdit = ' noDisp';
			if (!user.contact || !global.isBrowser() || v.ownerId != user.contact.id)
				v.hideMeMarketing = ' noDisp';
		}
		if (global.isBrowser())
			v.displaySocialShare = 'display: none; ';
		p = v._isOpen && v._isOpen > 0 ? 1 : v._openTimesEntries && v._openTimesEntries > 0 ? 0 : null;
		if (v.openTimesBankholiday == true)
			v.openTimesBankholiday = '<div>' + ui.l('locations.closedOnBankHoliday') + '</div>';
		var wtd = pageWhatToDo.getCurrentMessage();
		if (wtd && wtd.active) {
			var d = global.date.getDate(wtd.time);
			v.wtdTime = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
		} else {
			var h = (new Date().getHours() + 1) % 24;
			v.wtdTime = h + ':00';
			if (h < 10)
				v.wtdTime = '0' + v.wtdTime;
		}
		if (!v.ownerId)
			v.urlNotActive = ' active="0"';
		v.pressedCopyButton = pageChat.copyLink.indexOf(global.encParam((v.isEvent ? 'e' : 'l') + '=' + id)) > -1 ? ' buttonPressed' : '';
		v.cat = '';
		for (var i = 0; i < v.category.length; i++)
			v.cat = v.cat + ',' + v.category.substring(i, i + 1);
		v.cat = v.cat.substring(1);
		if (user.contact) {
			communication.ajax({
				url: global.server + 'action/map?source=' + geoData.latlon.lat + ',' + geoData.latlon.lon + '&destination=' + v.latitude + ',' + v.longitude,
				progressBar: false,
				success(r) {
					var x = 0, f = function () {
						if (x++ > 20)
							return;
						if (!ui.q('[i="' + v.id + '"] img.map'))
							setTimeout(f, 100);
						else
							ui.attr('[i="' + v.id + '"] img.map', 'src', 'data:image/png;base64,' + r);
					};
					f.call();
				}
			});
		}
		return pageLocation.templateDetail(v);
	}
	static edit(id) {
		if (id) {
			if (pageLocation.locationsAdded == null) {
				communication.ajax({
					url: global.server + 'db/list?query=location_list&search=' + encodeURIComponent('location.contactId=' + user.contact.id),
					responseType: 'json',
					success(s) {
						pageLocation.locationsAdded = s.length - 1;
						pageLocation.edit(id);
					}
				});
				return;
			}
			if (pageLocation.locationsAdded <= global.minLocations)
				ui.navigation.openPopup(ui.l('attention'), ui.l('locations.editHint').replace('{0}', pageLocation.locationsAdded) + '<br/><br/><buttontext class="bgColor" onclick="pageLocation.edit()">' + ui.l('locations.new') + '</buttontext>');
			else
				pageLocation.editInternal(id, pageLocation.currentDetail);
		} else {
			var e = ui.q('menu').style.transform;
			if (e.indexOf('1') > -1)
				ui.navigation.toggleMenu();
			e = ui.q('[name="id"]');
			if (!e || !e.value) {
				if (ui.q('locations > div'))
					ui.navigation.hideMenu();
				pageLocation.editInternal();
				setTimeout(pageLocation.prefillAddress, 1200);
			}
		}
	}
	static editInternal(id, l) {
		var v;
		var draft = formFunc.getDraft('location' + (id ? id : ''));
		if (l) {
			v = model.convert(new Location(), l);
			if ((!v.ownerId && v.contactId == user.contact.id) || v.ownerId == user.contact.id)
				v.deleteButton = '<buttontext onclick="pageLocation.deleteElement(' + id + ',&quot;Location&quot;)" class="bgColor" id="deleteElement">' + ui.l('delete') + '</buttontext>';
		} else if (draft)
			v = draft.values;
		if (!v)
			v = [];
		var d = '' + v.category;
		for (var i = 0; i < d.length; i++)
			v['cat' + d.substring(i, i + 1)] = ' checked';
		if (id) {
			v.ot = '';
			v.OT = [];
			if (l.OT) {
				for (var i = 1; i < l.OT.length; i++)
					v.OT.push(model.convert(new LocationOpenTime(), l.OT, i));
			} else {
				for (var i = 1; i < 7; i++)
					v.OT.push({ day: i });
				v.OT.push({ day: 0 });
			}
			for (var i = 0; i < v.OT.length; i++) {
				v.OT[i].i = '' + i;
				v.OT[i]['wd' + v.OT[i].day] = ' selected';
				v.ot += '<div>' + pageLocation.templateEditOpenTimes(v.OT[i]) + '</div>';
			}
		} else {
			v.hint = '<div style="margin-bottom:2em;">' + ui.l('locations.newHint') + '</div>';
			v.hideOpenTimes = ' style="display:none;"';
		}
		for (var i = 0; i < ui.categories.length; i++)
			v['attr' + i] = v['attr' + i] ? v['attr' + i].replace(/\u0015/g, ',') : '';
		v.bankHolidayCheck = v.openTimesBankholiday == '1' ? ' checked' : '';
		if (v.parkingOption) {
			v.parkCheck1 = v.parkingOption.indexOf('1') > -1 ? ' checked' : '';
			v.parkCheck2 = v.parkingOption.indexOf('2') > -1 ? ' checked' : '';
			v.parkCheck3 = v.parkingOption.indexOf('3') > -1 ? ' checked' : '';
			v.parkCheck4 = v.parkingOption.indexOf('4') > -1 ? ' checked' : '';
		}
		if (v.budget) {
			v.budget0 = v.budget.indexOf('0') > -1 ? ' checked' : '';
			v.budget1 = v.budget.indexOf('1') > -1 ? ' checked' : '';
			v.budget2 = v.budget.indexOf('2') > -1 ? ' checked' : '';
		}
		if (!v.longitude)
			v.longitude = geoData.latlon.lon;
		if (!v.latitude)
			v.latitude = geoData.latlon.lat;
		ui.navigation.openPopup(ui.l('locations.' + (id ? 'edit' : 'new')).replace('{0}', v.name), pageLocation.templateEdit(v), 'pageLocation.saveDraft()');
		if (id)
			pageLocation.setEditAttributes();
		else
			setTimeout(pageLocation.setEditAttributes, 1000);
	}
	static event = {
		participations: null,

		edit(locationID, id, isEvent) {
			if (!isEvent)
				pageLocation.edit(locationID);
			else if (id)
				pageLocation.event.editInternal(locationID, id, pageLocation.currentDetail);
			else
				pageLocation.event.editInternal(locationID);
		},
		editInternal(locationID, id, v) {
			var draft = formFunc.getDraft('event' + locationID + (id ? '_' + id : ''));
			if (v)
				v = model.convert(new Location(), v);
			else if (draft)
				v = draft.values;
			else
				v = [];
			if (v.event.startDate.indexOf(':') > -1) {
				v.startDate = v.event.startDate.substring(0, v.event.startDate.lastIndexOf('.'));
				v.startDate = v.startDate.substring(0, v.startDate.lastIndexOf(':'));
			}
			if (v.event.endDate)
				v.endDate = v.event.endDate;
			v.idOrNull = id ? id : 'null';
			var d = new Date();
			v.today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
			v.id = id;
			if (!id)
				v.hint = '<div style="margin-bottom:2em;">' + ui.l('events.newHint') + '</div>';
			v.locationID = locationID;
			if (!v.event.type || v.event.type == 'o')
				v.type_o = ' checked';
			if (v.event.type == 'w1')
				v.type_w1 = ' checked';
			if (v.event.type == 'w2')
				v.type_w2 = ' checked';
			if (v.event.type == 'm')
				v.type_m = ' checked';
			if (v.event.type == 'y')
				v.type_y = ' checked';
			if (!v.event.ownerId || v.event.ownerId != user.contact.id)
				v.hideOwnerFields = 'style="display:none;"';
			if (v.event.confirm)
				v.confirm = ' checked';
			if (!v.event.visibility)
				v.event.visibility = '3';
			v['visibility' + v.event.visibility] = ' checked';
			if (!v.startDate) {
				var d = new Date();
				d.setDate(d.getDate() + 1);
				v.startDate = d.getFullYear() + ' - ' + ('0' + (d.getMonth() + 1)).slice(-2) + ' - ' + ('0' + d.getDate()).slice(-2) + 'T' + ('0' + d.getHours()).slice(-2) + ': 00';
			}
			if (!v.endDate) {
				var d = new Date();
				d.setMonth(d.getMonth() + 6);
				v.endDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + ' - ' + ('0' + d.getDate()).slice(-2);
			}
			v.text = v.event.text;
			v.maxParticipants = v.event.maxParticipants;
			v.link = v.event.link;
			v.price = v.event.price;
			ui.navigation.openPopup(v.name, pageLocation.templateEditEvent(v), 'pageLocation.event.saveDraft()');
			pageLocation.event.setForm();
		},
		getCalendarList(data, onlyMine, today) {
			if (!data || data.length == 0)
				return '';
			if (!today)
				today = new Date();
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
				var d1 = global.date.getDate(v.event.startDate);
				var d2 = global.date.getDate(v.event.endDate);
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
							s = pageLocation.event.getParticipation({ id: v.event.id, date: d1.getFullYear() + '-' + ('0' + (d1.getMonth() + 1)).slice(-2) + '-' + ('0' + d1.getDate()).slice(-2) });
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
					v.event.startDate = global.date.getDate(v.event.startDate);
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
		},
		getParticipateButton(p, v) {
			var participation = pageLocation.event.getParticipation(p);
			var text = '';
			if (participation.state == 1 || participation.state == null || !v.event.confirm)
				text += '<buttontext pID="' + (participation.id ? participation.id : '') + '" s="' + (participation.id ? participation.state : '') + '" confirm="' + v.event.confirm + '" class="bgColor" onclick="pageLocation.event.participate(event,' + JSON.stringify(p).replace(/"/g, '&quot;') + ')" max="' + (v.maxParticipants ? v.maxParticipants : 0) + '">' + ui.l('events.participante' + (participation.state == 1 ? 'Stop' : '')) + '</buttontext>';
			if (v.CP && v.CP.length > 1)
				text += '<buttontext class="bgColor" onclick="pageLocation.event.toggleParticipants(event,' + JSON.stringify(p) + ',' + v.event.confirm + ')">' + ui.l('events.participants') + '</buttontext>';
			return text;
		},
		getParticipation(p) {
			if (pageLocation.event.participations) {
				for (var i = 0; i < pageLocation.event.participations.length; i++) {
					if (pageLocation.event.participations[i].eventId == p.id && pageLocation.event.participations[i].eventDate == p.date)
						return pageLocation.event.participations[i];
				}
			}
			return {};
		},
		init() {
			communication.ajax({
				url: global.server + 'db/list?query=event_participate&search=' + encodeURIComponent('eventParticipate.contactId=' + user.contact.id),
				responseType: 'json',
				success(r) {
					pageLocation.event.participations = [];
					for (var i = 1; i < r.length; i++)
						pageLocation.event.participations.push(model.convert(new EventParticipate(), r, i));
				}
			});
		},
		listEvents(l) {
			var activeID = ui.navigation.getActiveID()
			if (activeID == 'search')
				ui.attr('search', 'type', 'events');
			var as = pageLocation.event.getCalendarList(l);
			lists.data[activeID] = as;
			return pageLocation.event.listEventsInternal(as);
		},
		listEventsInternal(as, date) {
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
					var startDate = global.date.getDate(v.event.startDate);
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
						v.time = global.separator + t;
						if (v.ownerId == v.contact.id)
							v._message1 = '<span class="colorHighlight">' + v.event.text + '</span>';
						else
							v._message1 = v.event.text;
						v.locID = v.id;
						pageLocation.listInfos(v);
						v.id = v.event.id;
						if (!outdated) {
							v.id += '_' + startDate.getFullYear();
							if (startDate.getMonth() < 9)
								v.id += '0';
							v.id += (startDate.getMonth() + 1);
							if (startDate.getDate() < 10)
								v.id += '0';
							v.id += startDate.getDate();
						}
						v.classBGImg = v.imageList ? '' : bg;
						if (pageLocation.event.getParticipation(v.id).state == 1)
							v.classParticipate = ' participate';
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
		},
		listEventsMy(l) {
			var as = pageLocation.event.getCalendarList(l, true);
			lists.data[ui.navigation.getActiveID()] = as;
			return pageLocation.event.listEventsInternal(as);
		},
		participate(event, id) {
			event.stopPropagation();
			event = event.target;
			var participateID = event.getAttribute('pID');
			var d = { classname: 'EventParticipate', values: {} };
			if (participateID) {
				d.values.state = event.getAttribute('s') == 1 ? -1 : 1;
				d.id = participateID;
				if (event.getAttribute('confirm') == 1) {
					var s = ui.q('#stopParticipateReason').val;
					if (!s) {
						pageLocation.event.stopParticipate(id);
						return;
					}
					if (s.trim().length == 0)
						return;
					d.values.reason = s;
				}
			} else {
				d.values.state = 1;
				d.values.eventId = id.split('_')[1];
				d.values.eventDate = id.split('_')[2];
			}
			communication.ajax({
				url: global.server + 'db/one',
				method: participateID ? 'PUT' : 'POST',
				body: d,
				success(r) {
					var e = ui.q('[name="button_' + id + '"]');
					if (r)
						ui.attr(e, 'pID', r);
					if (e.getAttribute('s') == '1') {
						if (e.getAttribute('confirm') == '1')
							e.parentNode.innerHTML = '';
						else {
							ui.attr(e, 's', '-1');
							e.innerText = ui.l('events.participante');
						}
					} else {
						ui.attr(e, 's', '1');
						e.innerText = ui.l('events.participanteStop');
					}
					ui.navigation.hidePopup();
					pageLocation.event.init();
				}
			});
		},
		refreshToggle() {
			var e = ui.q('detail [name="events"]');
			if (e) {
				var id = ui.q('detail').getAttribute('i');
				ui.toggleHeight(e, function () {
					e.innerHTML = '';
					pageLocation.event.toggle(id);
				});
			}
		},
		save() {
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
					d1 = global.date.getDate(start.value);
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
						d2 = global.date.getDate(end.value);
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
			ui.q('[name="confirm"]').value = ui.q('[name="eventconfirm"]:checked')[0] ? 1 : 0;
			var s;
			if (id)
				s = '_' + id;
			else
				s = '';
			s = ui.val('[name="locationId"]') + s;
			var v = formFunc.getForm('editElement');
			v.classname = 'Event';
			if (id)
				v.id = id;
			communication.ajax({
				url: global.server + 'db/one',
				method: id ? 'PUT' : 'POST',
				body: v,
				success() {
					ui.navigation.hidePopup();
					formFunc.removeDraft('event' + s);
					pageLocation.event.refreshToggle();
				}
			});
		},
		saveDraft() {
			var s = ui.q('detail').getAttribute('i');
			if (s)
				s = '_' + s;
			else
				s = '';
			formFunc.saveDraft('event' + ui.q('[name="location.id"]').value + s, formFunc.getForm('editElement'));
		},
		setForm() {
			var b = ui.q('[name="type"]').checked;
			ui.q('label[name="startDate"]').innerText = ui.l('events.' + (b ? 'date' : 'start'));
			ui.css('label[name="endDate"]', 'display', b ? 'none' : '');
		},
		showNext(event, next) {
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
		},
		stopParticipate(id) {
			var e = ui.q('[name="button_' + id + '"]');
			ui.navigation.openPopup(ui.l('events.stopParticipate'), ui.l('events.stopParticipateText') + '<br/><textarea id="stopParticipateReason" placeholder="' + ui.l('events.stopParticipateHint') + '" style="margin-top:0.5em;"></textarea><buttontext class="bgColor" style="margin-top:1em;" pID="' + e.getAttribute('pID') + '" s="' + e.getAttribute('s') + '" confirm="' + e.getAttribute('confirm') + '" onclick="pageLocation.event.participate(event,&quot;' + id + '&quot;)">' + ui.l('events.stopParticipateButton') + '</buttontext>');
		},
		toggle(id) {
			var d = ui.q('detail[i="' + id + '"] [name="events"]');
			if (!d.innerHTML) {
				var e = ui.q('popup:not([style*="none"]) detail');
				if (!e)
					e = ui.q('detail');
				var field = e.getAttribute('type');
				communication.ajax({
					url: global.server + 'db/list?query=event_list&search=' + encodeURIComponent('event.' + field + 'Id=' + id),
					responseType: 'json',
					success(r) {
						pageLocation.event.toggleInternal(r, id, field);
					}
				});
			} else
				details.togglePanel(ui.q('detail[i="' + id + '"] [name="events"]'));
		},
		toggleInternal(r, id, field) {
			var bg = ui.classContains('detail[i="' + id + '"] [name="buttonEvents"]', 'bgBonus') ? 'bgBonus' : 'bgColor';
			var a = pageLocation.event.getCalendarList(r), newButton = field == 'LOCATION' ? '<buttontext onclick="pageLocation.event.edit(' + id + ')" class="' + bg + '">' + ui.l('events.new') + '</buttontext>' : '';
			var s = '', v, text;
			var b = user.contact.id == id;
			if (b && ui.q('detail[i="' + id + '"] [name="events"]').getAttribute('active'))
				b = false;
			var navButtons = a.length > 2 ? '<buttontext class="' + bg + '" onclick="pageLocation.event.showNext(event,false)">&lt;</buttontext><buttontext class="' + bg + '" onclick="pageLocation.event.showNext(event,true)">&gt;</buttontext>' : '';
			for (var i = 1; i < a.length; i++) {
				v = model.convert(new Location(), a, i);
				v.bg = bg;
				var s2 = global.date.formatDate(v.startDate, 'weekdayLong');
				var date = v.startDate.getFullYear() + '-' + ('0' + (v.startDate.getMonth() + 1)).slice(-2) + '-' + ('0' + v.startDate.getDate()).slice(-2);
				var idIntern = v.id + '_' + date;
				s2 = global.date.getDateHint(v.startDate).replace('{ 0}', s2);
				var oc = '<div style="text-align:left;margin-left:9em;overflow:hidden;"';
				if (field == 'CONTACT')
					oc += ' onclick="ui.navigation.autoOpen(&quot;' + global.encParam('e=' + idIntern) + '&quot;,event)"';
				else if (v.link)
					oc += ' onclick="ui.navigation.openHTML(&quot;' + v.link + '&quot;)"';
				oc += '>';
				var img;
				if (v.imageList || v.location.imageList)
					img = global.serverImg + v[(v.imageList ? 'event' : 'location') + '.imageList'];
				else
					img = 'images/event.svg" class="' + bg;
				s2 = '<img src="' + img + '"/>' + oc + s2;
				var partButton = pageLocation.event.getParticipateButton({ id: id, date: date }, v);
				if (user.contact.id == v.contactId)
					partButton += '<buttontext class="' + bg + '" onclick="pageLocation.event.edit(' + id + ',' + v.id + ');event.stopPropagation()">' + ui.l('edit') + '</buttontext>';
				text = '';
				if (v.price > 0)
					text += global.separator + ui.l('events.priceDisp').replace('{0}', parseFloat(v.price).toFixed(2));
				if (v.maxParticipants)
					text += global.separator + ui.l('events.maxParticipants') + ':&nbsp;' + v.maxParticipants;
				var p = pageLocation.event.getParticipation({ id: v.id, date: date });
				if (v.event.confirm == 1) {
					text += global.separator + ui.l('events.participationMustBeConfirmed');
					if (p.state == 1)
						text += global.separator + ui.l('events.confirmed');
					else if (p.state == 0)
						text += global.separator + ui.l('events.canceled');
				}
				if (text)
					text = '<br/>' + text.substring(global.separator.length);
				text += '<br/>' + v.text;
				if (field == 'CONTACT')
					text = '<br/>' + v.location.name + text;
				s += '<auxEvents' + (p.state == 1 ? ' class="participate"' : '') + ' style="' + (i > 1 ? 'display: none; ' : '') + '">' + s2 + text + '</auxEvents><div style="padding-top:0.5em;clear:both;">' + newButton + partButton + navButtons + '</div></div>';
			}
			if (s)
				s = ui.l('events.myEvents') + '<br/>' + s;
			else
				s = '<detailTogglePanel>' + ui.l('events.noEvents') + (newButton ? '<br/><br/>' + newButton : '') + '</detailTogglePanel>';
			var e = ui.q('detail[i="' + id + '"] [name="events"]');
			e.innerHTML = s;
			details.togglePanel(e);
		},
		toggleParticipants(event, id, confirm) {
			if (event.stopPropagation)
				event.stopPropagation();
			var d = id.substring(id.lastIndexOf('_') + 1), i = id.substring(id.indexOf('_') + 1, id.lastIndexOf('_'));
			var e = ui.q('detail[i="' + id + '"] [name="participants"]');
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
	};
	static filterList() {
		var activeID = ui.navigation.getActiveID();
		var d = lists.data[activeID];
		if (!d)
			return;
		var v = ui.qa(activeID + ' filters input[name="filterLocationTown"]:checked');
		var v2 = ui.qa(activeID + ' filters input[name="filterLocationCategories"]:checked');
		var v3 = ui.qa(activeID + ' filters input[name="filterCompass"]:checked');
		var towns = [], cats = [], comp = [];
		for (var i = 0; i < v.length; i++)
			towns[v[i].getAttribute('label')] = 1;
		for (var i = 0; i < v2.length; i++)
			cats[v2[i].value] = 1;
		for (var i = 0; i < v3.length; i++)
			comp[v3[i].value] = 1;
		for (var i = 1; i < d.length; i++) {
			if (d[i] != 'outdated') {
				var e = model.convert(new Location(), d, i);
				var match = (v.length == 0 || towns[e.town]) && (v2.length == 0 || pageLocation.hasCategory(cats, e.category)) && (v3.length == 0 || pageLocation.isInPosition(comp, e._angle));
				e = ui.q(activeID + ' [i="' + e.id + '"]');
				ui.attr(e, 'filtered', !match);
			}
		}
		lists.execFilter();
		pageLocation.scrollMap();
	}
	static getFilterFields() {
		var l = lists.data[ui.navigation.getActiveID()];
		var r = [], r2 = [], r3 = [], r4 = [], E = [], N = [], W = [], S = [], own = 0;
		N['N'] = 1;
		S['S'] = 1;
		W['W'] = 1;
		E['E'] = 1;
		var isEvent = l[0].toString().indexOf('event.id') > 0, hasAngel;
		for (var i = 1; i < l[0].length; i++) {
			if (l[0][i] == '_angle') {
				hasAngel = true;
				break;
			}
		}
		if (!hasAngel)
			l[0].push('_angle');
		for (var i = 1; i < l.length; i++) {
			var v = model.convert(new Location(), l, i);
			if (!hasAngel) {
				v._angle = geoData.getAngel(geoData.latlon, { lat: v.latitude, lon: v.longitude });
				l[i].push(v._angle);
			}
			if (v.town && !r3[v.town]) {
				r.push(v.town);
				r3[v.town] = 1;
			}
			if (user.contact && (isEvent && v.event.contactId == user.contact.id || !isEvent && v.ownerId == user.contact.id))
				own++;
			var s = '' + v.category;
			for (var i2 = 0; i2 < s.length; i2++)
				r2[s.substring(i2, i2 + 1)] = 1;
			if (!r4['E'] && pageLocation.isInPosition(E, v._angle))
				r4['E'] = 1;
			if (!r4['N'] && pageLocation.isInPosition(N, v._angle))
				r4['N'] = 1;
			if (!r4['W'] && pageLocation.isInPosition(W, v._angle))
				r4['W'] = 1;
			if (!r4['S'] && pageLocation.isInPosition(S, v._angle))
				r4['S'] = 1;
		}
		var s = '', i2 = 0, m = ' onclick="pageLocation.filterList()" deselect="true"/>', sep = '<filterSeparator></filterSeparator>';
		for (var e in r2)
			i2++;
		if (i2 > 1) {
			for (var i = 0; i < ui.categories.length; i++) {
				if (r2[i])
					s += '<input type="radio" name="filterLocationCategories" value="' + i + '" label="' + ui.categories[i].label + '"' + m;
			}
			s += sep;
		}
		i2 = 0;
		for (var e in r4)
			i2++;
		if (i2 > 1) {
			for (var e in r4)
				s += '<input type="radio" name="filterCompass" value="' + e + '" label="' + ui.l('locations.compass' + e) + '"' + m;
			s += sep;
		}
		if (false && r.length > 1) {
			r = r.sort();
			for (var i = 0; i < r.length; i++)
				s += '<input type="radio" label="' + r[i] + '" name="filterLocationTown"' + m;
			s += sep;
		}
		if (s)
			s = s.substring(0, s.lastIndexOf(sep));
		var map = '';
		if (ui.navigation.getActiveID() == 'locations')
			map = '<buttontext onclick="pageLocation.toggleMap()" style="margin:1em 0.25em;" class="bgColor">' + ui.l('filterLocMapButton') + '</buttontext>';
		if (s)
			return '<div>' + s + '</div>' + map;
		return '<div style="padding-bottom:1em;">' + ui.l('filterNoDifferentValues') + '</div>' + map;
	}
	static getOpenTimes(r) {
		var s = '';
		var today = new Date().getDay();
		var a = [];
		for (var i = 1; i < r.length; i++) {
			var v = model.convert(new LocationOpenTime(), r, i);
			var d = v.day;
			var t = '<from>' + v.openAt.substring(0, 5) + '</from><sep>-</sep><to>' + v.closeAt.substring(0, 5) + '</to>';
			if (a[d])
				t = a[d] + '<br/>' + t;
			a[d] = t;
		}
		for (var i = 0; i < 7; i++) {
			var i2 = (i + 1) % 7;
			if (a[i2]) {
				var d = ui.l('weekday' + i2);
				var t = a[i2];
				s += '<row'
				if (i2 == today)
					s += ' class="colorHighlight"';
				s += '><day>' + d + '</day><times>' + t + '</times></row>';
			}
		}
		return s;
	}
	static hasCategory(cats, catString) {
		catString = '' + catString;
		for (var i = 0; i < catString.length; i++) {
			if (cats[catString.substring(i, i + 1)])
				return true;
		}
	}
	static init() {
		if (!ui.q('locations').innerHTML)
			lists.setListDivs('locations');
		if (!ui.q('locations listResults row')) {
			var e = ui.q('menu');
			if (ui.cssValue(e, 'transform').indexOf('1') > 0) {
				if (e.getAttribute('type') != 'locations') {
					ui.on('menu', 'transitionend', function () {
						ui.navigation.toggleMenu('locations');
					}, true);
					setTimeout(function () { e.style.transform = 'scale(0)'; }, 10);
				}
			} else
				ui.navigation.toggleMenu('locations');
		}
		if (!pageLocation.map.svgLocation)
			communication.ajax({
				url: '/images/location.svg',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'rgb(246, 255, 187)');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '10');
					pageLocation.map.svgLocation = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});
		if (!pageLocation.map.svgMe)
			communication.ajax({
				url: '/images/contact.svg',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'rgb(246, 255, 187)');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '10');
					pageLocation.map.svgMe = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});

	}
	static isInPosition(position, angle) {
		for (var e in position) {
			if (e == 'E' && angle > 45 && angle <= 135)
				return 'E';
			if (e == 'S' && angle > 135 && angle <= 225)
				return 'S';
			if (e == 'W' && angle > 225 && angle <= 315)
				return 'W';
			if (e == 'N' && (angle > 315 || angle <= 45))
				return 'N';
		}
	}
	static listInfos(v) {

		v.attr = ui.getAttributes(v, 'list');
		if (v.attr.total && v.attr.totalMatch / v.attr.total > 0)
			v.matchIndicator = parseInt(v.attr.totalMatch / v.attr.total * 100 + 0.5) + '%';
		if (!v._message1)
			v._message1 = v.attr.text;
		if (!v._message2)
			v._message2 = v.description;
		if (v.parkingOption) {
			var p = v.parkingOption.indexOf('1') > -1 ||
				v.parkingOption.indexOf('2') > -1 ? ui.l('locations.parkingPossible') :
				v.parkingOption.indexOf('4') > -1 ? ui.l('locations.parking4') : '';
			if (!v._message1)
				v._message1 = p;
			else if (!v._message2)
				v._message2 = p;
		}
		if (v._openTimesEntries) {
			var ot = v._isOpen && v._isOpen > 0 ? ui.l('locations.open') :
				v._openTimesEntries && v._openTimesEntries > 0 ? ui.l('locations.closed') : '';
			if (!v._message1)
				v._message1 = ot;
			else if (!v._message2)
				v._message2 = ot;
		}
	}
	static listLocation(l) {
		if (ui.navigation.getActiveID() == 'search')
			ui.attr('search', 'type', 'locations');
		return pageLocation.listLocationInternal(l);
	}
	static listLocationInternal(l) {
		if (ui.navigation.getActiveID() == 'locations' && ui.q('map') && ui.cssValue('map', 'display') != 'none')
			pageLocation.toggleMap();
		var s = '', v;
		for (var i = 1; i < l.length; i++) {
			v = model.convert(new Location(), l, i);
			v.locID = v.id;
			v.classBGImg = v.imageList ? '' : 'bgColor';
			if (v.locationFavorite.favorite)
				v.classFavorite = ' favorite';
			pageLocation.listInfos(v);
			if (v.imageList)
				v.image = global.serverImg + v.imageList;
			else
				v.image = 'images/location.svg" style="padding: 1em; ';
			if (v.bonus)
				v.present = '<badge class="bgBonus" style="display:block;"><img src="images/present.svg" class="present"></badge>';
			v.type = 'Location';
			v.render = 'pageLocation.detailLocationEvent';
			v._message = v.time ? v.time + '<br/>' : '';
			v._message += v._message1 ? v._message1 + '<br/>' : '';
			v._message += v._message2 ? v._message2 : '';
			v.query = (user.contact ? 'location_list' : 'location_anonymousList') + '&search=' + encodeURIComponent('location.id=' + v.id);
			s += pageLocation.templateList(v);
		}
		return s;
	}
	static prefillAddress() {
		if (geoData.localized && ui.q('input[name="name"]')) {
			if (!ui.val('[name="address"]')) {
				communication.ajax({
					url: global.server + 'action/google?param=' + encodeURIComponent('latlng=' + geoData.latlon.lat + ',' + geoData.latlon.lon),
					responseType: 'json',
					success(r) {
						if (r.formatted)
							ui.html('[name="address"]', r.formatted);
					}
				});
			}
			communication.ajax({
				url: global.server + 'action/google?param=' + encodeURIComponent('place/nearbysearch/json?radius=100&sensor=false&location=' + geoData.latlon.lat + ',' + geoData.latlon.lon),
				responseType: 'json',
				success(r) {
					if (r.status == 'OK') {
						r = r.results;
						var s = '', r2 = [];
						for (var i = 0; i < r.length; i++) {
							if (r[i].types[0] && r[i].types[0].indexOf('locality') < 0 && r[i].types[0].indexOf('route') < 0 && r[i].name) {
								s += '<li onclick="pageLocation.setLocationName(event)" d="' + r[i].types[0] + '" n="' + r[i].name + '" a="' + r[i].vicinity + '">' + r[i].name + '</li>';
								if (r[i].vicinity && r[i].vicinity.indexOf && r[i].vicinity.indexOf(',') > 0)
									r2[i] = [r[i].name, r[i].types[0], r[i].vicinity, r[i].geometry.location.lat, r[i].geometry.location.lng];
							}
						}
						if (s) {
							ui.html('locationNameInputHelper', '<ul>' + s + '</ul><div style="text-align:center;"><buttontext onclick="pageLocation.closeLocationInputHelper()" class="bgColor">' + ui.l('locations.closeInputHelper') + '</buttontext></div>');
							pageLocation.showLocationInputHelper();
							ui.q('form input[name="name"]').onfocus = pageLocation.showLocationInputHelper;
						}
					}
				}
			});
		}
	}
	static prefillOpenTimesFields(event, field) {
		var e = event.target;
		var s = e.getAttribute('name');
		var v = e.value;
		s = parseInt(s.substring(s.indexOf('At') + 2), 10);
		while (e = ui.q('[name="openTimes.' + field + 'At' + (++s) + '"]')) {
			if (!e.value)
				e.value = v;
		}
	}
	static replaceMapDescData(s) {
		if (!s)
			return '';
		return s.replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/\n/g, '\u0015').replace(/\r/g, '');
	}
	static sanatizeFields() {
		var sa = '';
		var s = ui.qa('[name="parkingOption2"]:checked');
		for (var i = 0; i < s.length; i++)
			sa += ',' + s[i].value;
		if (sa.length > 0)
			sa = sa.substring(1);
		ui.q('[name="parkingOption"]').value = sa;
		sa = '';
		s = ui.qa('[name="locationcategory"]:checked');
		for (var i = 0; i < s.length; i++)
			sa += s[i].value;
		ui.q('[name="category"]').value = sa;
		sa = '';
		s = ui.qa('[name="locationbudget"]:checked');
		for (var i = 0; i < s.length; i++)
			sa += s[i].value;
		ui.q('[name="budget"]').value = sa;
		s = ui.q('[name="openTimesBankholiday2"]');
		ui.q('[name="openTimesBankholiday"]').value = s && s.length > 0 && s[0].checked ? '' + true : '' + false;
		for (var i = 0; i < ui.categories.length; i++) {
			var s2 = '';
			if (ui.q('#inputHelperATTRIBS' + i)) {
				s = ui.q('#inputHelperATTRIBS' + i).children;
				for (var i2 = 0; i2 < s.length; i2++) {
					if (s[i2].checked)
						s2 += '\u0015' + (s[i2].value < 10 ? '00' : s[i2].value < 100 ? '0' : '') + Number(s[i2].value);
				}
				if (s2)
					s2 = s2.substring(1);
			}
			ui.q('[name="attr' + i + '"]').value = s2;
		}
	}
	static save() {
		ui.html('popupHint', '');
		formFunc.resetError(ui.q('[name="locationcategory"]'));
		formFunc.resetError(ui.q('[name="name"]'));
		formFunc.resetError(ui.q('[name="address"]'));
		formFunc.resetError(ui.q('[name="parkingOption2"]'));
		if (!ui.q('[name="locationcategory"]:checked'))
			formFunc.setError(ui.q('[name="locationcategory"]'), 'locations.errorCategory');
		if (!ui.val('[name="name"]'))
			formFunc.setError(ui.q('[name="name"]'), 'locations.errorName');
		else
			formFunc.validation.filterWords(ui.q('[name="name"]'));
		if (!ui.val('[name="description"]'))
			formFunc.validation.filterWords(ui.q('[name="description"]'));
		if (!ui.val('[name="address"]'))
			formFunc.setError(ui.q('[name="address"]'), 'locations.errorAddress');
		else if (ui.val('[name="address"]').indexOf('\n') < 0)
			formFunc.setError(ui.q('[name="address"]'), 'locations.errorAddressFormat');
		if (!ui.qa('[name="parkingOption2"]')[0].checked &&
			!ui.qa('[name="parkingOption2"]')[1].checked &&
			!ui.qa('[name="parkingOption2"]')[2].checked &&
			!ui.qa('[name="parkingOption2"]')[3].checked)
			formFunc.setError(ui.q('[name="parkingOption2"]'), 'locations.errorParking');
		if (ui.q('popup errorHint')) {
			ui.scrollTo('popupContent', 0);
			return;
		}
		pageLocation.sanatizeFields();
		var id = ui.val('[name="id"]');
		var v = formFunc.getForm('editElement');
		v.classname = 'Location';
		if (id) {
			v.id = id;
			communication.ajax({
				url: global.server + 'action/one',
				method: 'PUT',
				body: v,
				success() {
					communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_list&search=' + encodeURIComponent('location.id=' + id), function (l) {
						var e = ui.q('locations [i="' + id + '"]'), l2 = lists.data['locations'];
						e.outerHTML = pageLocation.listLocation(l);
						for (var i = 1; i < l2.length; i++) {
							var v = model.convert(new Location(), l2, i);
							if (v.id == id) {
								l2[i] = l[1];
								break;
							}
						}
						ui.addFastButton('locations [i="' + id + '"]');
						return '&nbsp;';
					});
					ui.navigation.goTo('locations', null, true);
					formFunc.removeDraft('location' + id);
				}
			});
		} else {
			communication.ajax({
				url: global.server + 'db/one',
				method: 'POST',
				body: v,
				error(e) {
					if (e.status == 500 && e.response && e.response.indexOf('exists') > 0)
						ui.html('popupHint', ui.l('locations.alreadyExists'));
					else
						communication.onError(e);
				},
				success() {
					ui.navigation.hidePopup();
					formFunc.removeDraft('location' + id);
				}
			});
		}
	}
	static saveDraft() {
		pageLocation.sanatizeFields();
		var a = formFunc.getForm('editElement');
		a['OT'] = [];
		a['OT'][0] = ['locationOpenTime.day', 'locationOpenTime.openAt', 'locationOpenTime.closeAt', 'locationOpenTime.id'];
		var e, i = 1;
		while ((e = ui.q('[name="locationOpenTime.day' + i + '"]'))) {
			a['OT'][i] = [e.value, ui.val('[name="locationOpenTime.openAt' + i + '"]'), ui.val('[name="locationOpenTime.closeAt' + i + '"]'), ''];
			i++;
		}
		formFunc.saveDraft('location' + ui.q('popup input[name="id"]').value, a);
	}
	static scrollMap() {
		if (ui.cssValue('map', 'display') == 'none')
			return;
		if (pageLocation.map.scrollTop != ui.q('locations listBody').scrollTop) {
			pageLocation.map.scrollTop = ui.q('locations listBody').scrollTop;
			clearTimeout(pageLocation.map.timeout);
			pageLocation.map.timeout = setTimeout(pageLocation.scrollMap, 100);
			return;
		}
		var rows = ui.qa('locations listResults row');
		var id = ui.q('locations listBody').scrollTop - ui.emInPX, i = 0;
		for (; i < rows.length; i++) {
			if (rows[i].offsetTop > id && rows[i].getAttribute('filtered') != 'true') {
				id = parseInt(rows[i].getAttribute('i'));
				break;
			}
		}
		if (id == pageLocation.map.id || !rows[i])
			return;
		ui.classRemove('locations listResults row div.highlight', 'highlight');
		rows[i].children[0].classList = 'highlight';
		pageLocation.map.id = id;
		var d = model.convert(new Location(), lists.data['locations'], i + 1);
		var delta = ui.q('map').clientHeight / 320, x = 0.0625, zoom = 18;
		for (; zoom > 0; zoom--) {
			if (x * delta > d._geolocationDistance)
				break;
			x *= 2;
		}
		if (pageLocation.map.canvas) {
			pageLocation.map.markerMe.setMap(null);
			pageLocation.map.markerLocation.setMap(null);
			pageLocation.map.canvas.setCenter(new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon));
			pageLocation.map.canvas.setZoom(zoom);
		} else
			pageLocation.map.canvas = new google.maps.Map(document.getElementsByTagName("map")[0],
				{ zoom: zoom, center: new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon), mapTypeId: google.maps.MapTypeId.ROADMAP });
		pageLocation.map.markerMe = new google.maps.Marker(
			{
				map: pageLocation.map.canvas,
				title: d.name,
				contentString: '',
				icon: {
					url: pageLocation.map.svgMe,
					scaledSize: new google.maps.Size(60, 60),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(30, 60),
					fillColor: '#F6FFBB'
				},
				position: new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon)
			});
		pageLocation.map.markerLocation = new google.maps.Marker(
			{
				map: pageLocation.map.canvas,
				title: d.name, contentString: '',
				icon: {
					url: pageLocation.map.svgLocation,
					scaledSize: new google.maps.Size(60, 60),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(30, 60),
					fillColor: '#F6FFBB'
				},
				position: new google.maps.LatLng(d.latitude, d.longitude)
			});
	}
	static selectFriend(c) {
		ui.classRemove('.locationToFriend.selected', 'selected');
		ui.classAdd(c, 'selected');
	}
	static setEditAttributes() {
		if (ui.q('#loc_attrib')) {
			var cats = ui.qa('[name="locationcategory"]:checked'), s = '';
			for (var i = 0; i < cats.length; i++) {
				var v = ui.q('#loc_attrib').getAttribute('v' + cats[i].value);
				var v2 = ui.val('[name="attr' + cats[i].value + 'Ex"]');
				s += '<subCatTitle>' + ui.categories[cats[i].value].label + '</subCatTitle><input id="ATTRIBS' + cats[i].value + '" type="text" multiple="SubCategories' + cats[i].value + '" value="' + (v ? v : '') + '"/><input name="attr' + cats[i].value + 'Ex" value="' + (v2 ? v2 : '') + '" type="text" maxlength="250" placeholder="' + ui.l('contacts.blockReason100') + '" style="margin-bottom:1em;"/>';
			}
			ui.html('#loc_attrib', s);
			formFunc.initFields('#loc_attrib');
		}
	}
	static setLocationName(event) {
		var e = event.target;
		ui.q('form input[name="name"]').value = e.getAttribute('n');
		ui.q('form textarea[name="description"]').value = e.getAttribute('d');
		var s = e.getAttribute('a');
		if (s.indexOf(',') > 0) {
			var s2 = '';
			s = s.split(',');
			for (var i = 0; i < s.length; i++)
				s2 += s[i].trim() + '\n';
			ui.q('form textarea[name="address"]').value = s2.trim();
		}
	}
	static setOwner(id) {
		formFunc.resetError(ui.q('#taxNo'));
		formFunc.resetError(ui.q('#agb'));
		var b = -1;
		if (!ui.val('#taxNo'))
			b = formFunc.setError(ui.q('#taxNo'), 'locations.marketingNoTaxNo');
		if (!ui.q('#agb').checked)
			b = formFunc.setError(ui.q('#agb'), 'settings.noAGB');
		if (b == -1)
			ui.navigation.openHTML(global.server + 'qq?i=' + id + '&t=' + encodeURIComponent(ui.q('#taxNo').value) + '&v=' + encodeURIComponent(ui.q('[name="os0"]:checked').value));
	}
	static showLocationInputHelper(event) {
		var e = ui.q('locationNameInputHelper');
		if (e.innerHTML && ui.cssValue(e, 'display') == 'none' && (!event || !ui.q('form input[name="name"]').value))
			ui.toggleHeight(e);
	}
	static toggleFavorite(id) {
		var button = ui.q('detail[i="' + id + '"] [name="buttonFavorite"]');
		var idFav = button.getAttribute('idFav');
		var v = { classname: 'LocationFavorite' };
		if (idFav) {
			v.values = { favorite: button.getAttribute('fav') == 'true' ? false : true };
			v.id = idFav;
		} else
			v.values = { locationId: id };
		communication.ajax({
			url: global.server + 'db/one',
			method: idFav ? 'PUT' : 'POST',
			body: v,
			success(r) {
				if (r)
					ui.attr(button, 'idFav', r);
				ui.attr(button, 'fav', v.values.favorite ? true : false);
				if (v.values.favorite) {
					ui.classAdd(button, 'favorite');
					ui.classAdd('row.location[i="' + id + '"]', 'favorite');
				} else {
					ui.classRemove(button, 'favorite');
					ui.classRemove('row.location[i="' + id + '"]', 'favorite');
				}
			}
		});
	}
	static toggleMap() {
		if (ui.q('map').getAttribute('created')) {
			ui.classRemove('locations listResults row div.highlight', 'highlight');
			if (ui.cssValue('map', 'display') == 'none') {
				ui.css('locations listBody', 'margin-top', '20em');
				ui.css('locations listBody', 'padding-top', '0.5em');
			} else {
				ui.css('locations listBody', 'margin-top', '');
				ui.css('locations listBody', 'padding-top', '');
			}
			ui.toggleHeight('map', pageLocation.scrollMap);
			lists.toggleFilter();
			pageLocation.map.scrollTop = -1;
			pageLocation.map.id = -1;
			return;
		}
		ui.attr('map', 'created', new Date().getTime());
		communication.ajax({
			url: global.server + 'action/google?param=js',
			responseType: 'text',
			success(r) {
				var script = document.createElement('script');
				script.onload = function () {
					new google.maps.Geocoder();
					pageLocation.scrollMap();
					pageLocation.toggleMap();
					ui.on('locations listBody', 'scroll', pageLocation.scrollMap);
					lists.toggleFilter();
				};
				script.src = r;
				document.head.appendChild(script);
			}
		});
	}
	static toggleWhatToDo(id) {
		details.togglePanel(ui.q('detail[i="' + id + '"] [name="whatToDo"]'));
	}
}