import { communication } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
import { intro } from './intro';
import { lists } from './lists';
import { Contact, ContactChat, model } from './model';
import { pageContact } from './pageContact';
import { pageEvent } from './pageEvent';
import { pageHome } from './pageHome';
import { pageInfo } from './pageInfo';
import { pageSettings } from './pageSettings';
import { ui, formFunc } from './ui';
import { user } from './user';

export { pageChat };

class pageChat {
	static copyLink = '';
	static chatsNew = 0;
	static chatsUnseen = 0;
	static lastScroll = 0;
	static oldCleverTip = '';
	static admin = { id: 3, image: '' };

	static templateInput = v =>
		global.template`<chatInput>
	<chatMoreButton style="display:none;" onclick="pageChat.scrollToBottom()">v v v</chatMoreButton>
	<closeHint>${ui.l('chat.closeHint')}</closeHint>
	<chatButtons>
		<buttontext class="bgColor" onclick="pageChat.askLink()">${ui.l('share')}</buttontext>
		<buttontext class="bgColor" onclick="pageChat.askLocation()">${ui.l('chat.serviceLocation')}</buttontext>
		<buttontext class="bgColor" onclick="pageChat.askImage()">${ui.l('picture')}</buttontext>
		<buttontext class="bgColor quote" ${v.action}="pageChat.insertQuote(event);">${ui.l('quote')}</buttontext>
	</chatButtons>
	<textarea id="chatText" style="height:1.6em;" class="me" placeholder="${ui.l('chat.textHint')}"
		onkeyup="pageChat.adjustTextarea(this)">${v.draft}</textarea>
	<buttontext class="bgColor sendButton" ${v.action}="pageChat.sendChat(${v.id},null,event);">${ui.l('send')}</buttontext>
	<div style="display:none;text-align:center;"></div>
</chatInput>`;
	static templateMessage = v =>
		global.template`<chatMessage${v.class}><time${v.classUnseen}>${v.time}</time>${v.note}</chatMessage>`;

	static adjustTextarea(e) {
		ui.adjustTextarea(e);
		ui.css('chatConversation', 'bottom', (ui.q('chatInput').clientHeight + ui.emInPX / 2) + 'px');
	}
	static askLocation() {
		if (document.activeElement)
			document.activeElement.blur();
		if (geoData.localized) {
			var s = global.string.replaceInternalLinks(' :openPos(' + geoData.current.lat + ',' + geoData.current.lon + '): ');
			s = s.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.doNothing');
			ui.navigation.openPopup(ui.l('chat.askInsertCurrentLocationLink'), '<div style="text-align:center;margin-bottom:1em;"><div style="float:none;text-align:center;margin:1em 0;">' + s + '</div><buttontext class="bgColor" onclick="pageChat.insertLink()">' + ui.l('send') + '</buttontext></div>');
		} else
			ui.navigation.openPopup(ui.l('attention'), ui.l('chat.serviceSendError'));
	}
	static askLink() {
		if (document.activeElement)
			document.activeElement.blur();
		if (pageChat.copyLink) {
			var s = pageChat.copyLink.split('\n'), s2 = '', c = 0, s3;
			for (var i = 0; i < s.length; i++) {
				if (s[i]) {
					c++;
					s3 = global.string.replaceInternalLinks(' :open(' + s[i] + '): ').trim();
					s3 = s3.substring(0, s3.indexOf(' ')) + ' insertID="' + s[i] + '"' + s3.substring(s3.indexOf(' '));
					s2 += s3;
				}
			}
			if (c > 1)
				s2 = s2.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.toggleInsertCopyLinkEntry');
			else
				s2 = s2.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.doNothing');
			ui.navigation.openPopup(ui.l('chat.askInsertCopyLink' + (c > 1 ? 's' : '')), '<div style="text-align:center;margin:1em 0;">' + (c > 1 ? '<div id="askInsertCopyLinkHint">' + ui.l('chat.askInsertCopyLinksBody') + '</div>' : '') + '<div style="text-align:center;margin:1em 0;">' + s2 + '</div><buttontext class="bgColor" onclick="pageChat.insertLink(&quot;pressed&quot;)">' + ui.l('send') + '</buttontext></div>');
			ui.classAdd('popup .chatLinks', 'pressed');
		} else
			ui.navigation.openPopup(ui.l('attention'), ui.l('link.sendError').replace('{0}', '<br/><buttontext class="bgColor" style="margin:1em;">' + ui.l('share') + '</buttontext><br/>'));
	}
	static askImage() {
		if (document.activeElement)
			document.activeElement.blur();
		var popupVisible = ui.q('popupContent');
		ui.navigation.openPopup(ui.l('chat.sendImg'), '<form style="padding:0 2em;"><input type="hidden" name="contactId2" value="' + ui.q('chat').getAttribute('i') + '"><div style="margin:1em;"><input name="image" type="file"/></div></form><div style="text-align:center;margin-bottom:1em;"><buttontext onclick="pageChat.sendChatImage()" class="bgColor" id="popupSendImage" style="display:none;">' + ui.l('send') + '</buttontext></div>');
		if (!popupVisible && global.isBrowser()) {
			var e = ui.q('[name="image"]');
			if (e)
				e.click();
		}
	}
	static buttonChat() {
	}
	static chatAdjustScrollTop(i) {
		var e = ui.q('chatConversation');
		e.scrollTop = e.scrollTop + i;
	}
	static close(event, exec) {
		if (event) {
			var s = event.target.nodeName;
			if (event.target.onclick || event.target.onmousedown || s == 'TEXTAREA' || s == 'IMG' || s == 'NOTE')
				return;
		}
		var e = ui.q('chat');
		if (ui.cssValue(e, 'display') == 'none')
			return false;
		pageChat.saveDraft();
		ui.navigation.animation(e, 'slideUp', function () {
			ui.css(e, 'display', 'none');
			ui.html(e, '');
			ui.attr(e, 'i', null);
			var activeID = ui.navigation.getActiveID();
			if (activeID == 'contacts')
				pageContact.init();
			else if (activeID == 'events')
				pageEvent.init();
			else if (activeID == 'info')
				pageInfo.init();
			else if (activeID == 'home')
				pageHome.init();
			else if (activeID == 'detail')
				details.init();
			else if (activeID == 'settings')
				pageSettings.init();
			if (exec && exec.call)
				exec.call();
		});
		return true;
	}
	static closeList() {
		var e = ui.q('chatList');
		if (ui.cssValue(e, 'display') != 'none')
			ui.toggleHeight(e);
	}
	static detailChat(l, id) {
		ui.html('chat > div', '<chatConversation></chatConversation>' + pageChat.templateInput({
			id: id,
			draft: formFunc.getDraft('chat' + id),
			action: global.getDevice() == 'computer' ? 'onclick' : 'onmousedown'
		}));
		ui.attr('chat', 'i', id);
		var v;
		if (l.length > 1) {
			var date, s = '', d;
			for (var i = l.length - 1; i > 0; i--) {
				v = model.convert(new ContactChat(), l, i);
				d = global.date.formatDate(v.createdAt);
				d = d.substring(0, d.lastIndexOf(' '));
				if (date != d) {
					v.dateTitle = '<chatDateTitle>' + d + '</chatDateTitle>';
					date = d;
				}
				s += pageChat.renderMsg(v);
			}
			d = ui.q('chat[i="' + id + '"] chatConversation');
			d.innerHTML = d.innerHTML + s;
		}
		if (l.length < 3) {
			var e = ui.q('chatInput closeHint');
			e.style.display = 'block';
			e.style.transition = 'all 2s ease-out';
			setTimeout(function () {
				if (e && e.style)
					e.style.opacity = 0;
			}, 10000);
		}
		communication.ping();
	}
	static doCopyLink(event, id) {
		var s = global.encParam(id);
		if (pageChat.copyLink.indexOf(s) < 0)
			pageChat.copyLink = (pageChat.copyLink ? pageChat.copyLink + '\n' : '') + s;
		details.togglePanel(ui.q('detail text[name="' + event.target.getAttribute('name').replace('button', '').toLowerCase() + '"]'));
	}
	static doNothing() {
	}
	static formatTextMsg(v) {
		if (!v.note)
			return '';
		var s = v.note;
		if (s.indexOf(' :open') == 0 && s.lastIndexOf('): ') == s.length - 3)
			return global.string.replaceInternalLinks(s);
		s = s.trim();
		s = s.replace(/</g, '&lt;');
		s = global.string.replaceLinks(s);
		s = s.replace(/\n/g, '<br/>');
		s = global.string.replaceEmoji(s);
		if (v.action)
			s = '<a onclick="' + v.action + '">' + s + '</a>';
		return s;
	}
	static getSelectionBoundary(el, start) {
		var originalValue, textInputRange, precedingRange, pos, bookmark;
		if (typeof el['selectionEnd'] == 'number')
			return el['selectionEnd'];
		else if (document.selection && document.selection.createRange) {
			el.focus();
			var range = document.selection.createRange();
			if (range) {
				if (document.selection.type == 'Text')
					range.collapse(!!start);
				originalValue = el.value;
				textInputRange = el.createTextRange();
				precedingRange = el.createTextRange();
				pos = 0;
				bookmark = range.getBookmark();
				textInputRange.moveToBookmark(bookmark);
				if (originalValue.indexOf('\r\n') > -1) {
					textInputRange.text = ' ';
					precedingRange.setEndPoint('EndToStart', textInputRange);
					pos = precedingRange.text.length - 1;
					document.execCommand('undo');
				} else {
					precedingRange.setEndPoint('EndToStart', textInputRange);
					pos = precedingRange.text.length;
				}
				return pos;
			}
		}
		return 0;
	}
	static init() {
	}
	static initActiveChats() {
		if (!pageChat.admin.image) {
			communication.ajax({
				url: global.server + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=3'),
				responseType: 'json',
				success(r) {
					pageChat.admin.image = r['contact.imageList'];
					pageChat.admin.pseudonym = r['contact.pseudonym'];
				}
			});
		}
		communication.ajax({
			url: global.server + 'db/list?query=contact_listChat&limit=0',
			responseType: 'json',
			progressBar: false,
			success(r) {
				pageChat.listActiveChats(r);
			}
		});
	}
	static insertQuote(event) {
		try {
			event.stopPropagation();
			event.preventDefault();
		} catch (e) { }
		communication.ajax({
			url: global.server + 'action/quotation',
			success(r) {
				var e = ui.q('#chatText');
				var p = pageChat.getSelectionBoundary(e, false);
				var v = e.value;
				if (!v)
					v = '';
				else if (pageChat.oldCleverTip)
					v = v.replace(pageChat.oldCleverTip, '');
				v = v.substring(0, p) + r + v.substring(p);
				e.value = v;
				pageChat.adjustTextarea(e);
				pageChat.oldCleverTip = r;
			}
		});
	}
	static insertLink(clazz) {
		var s = '', e = ui.qa('popup .chatLinks' + (clazz ? '.' + clazz : ''));
		for (var i = 0; i < e.length; i++) {
			if (e[i].getAttribute('insertID'))
				s += ' :open(' + e[i].getAttribute('insertID') + '): ';
			else
				s += ' :openPos(' + geoData.current.lat + ',' + geoData.current.lon + '): ';
		}
		if (s)
			pageChat.sendChat(ui.q('chat').getAttribute('i'), s);
		ui.navigation.hidePopup();
	}
	static insertLinkInGroup() {
		var s = pageChat.copyLink.split('\n'), s2 = '';
		var e = ui.q('#groupChatText');
		var v = e.value;
		if (!v)
			v = '';
		for (var i = 0; i < s.length; i++) {
			if (s[i] && v.indexOf(' :open(' + s[i] + '): ') < 0)
				s2 += ' :open(' + s[i] + '): ';
		}
		if (s2) {
			var p = pageChat.getSelectionBoundary(e, false);
			v = v.substring(0, p) + s2 + v.substring(p);
			e.value = v;
		} else
			ui.html('popupHint', ui.l('link.sendError').replace('{0}', '<br/><buttontext class="bgColor" style="margin:1em;">' + ui.l('share') + '</buttontext><br/>'));
	}
	static listActiveChats(d) {
		var f = function () {
			var e = ui.q('chatList');
			if (e.getAttribute("toggle"))
				setTimeout(f, 500);
			else {
				var s = '';
				for (var i = 1; i < d.length; i++) {
					var v = model.convert(new Contact(), d, i);
					if (v.imageList)
						v.image = global.serverImg + v.imageList;
					else
						v.image = 'images/contact.svg';
					if (v._maxDate.indexOf('.') > 0)
						v._maxDate = v._maxDate.substring(0, v._maxDate.indexOf('.'));
					s += '<div onclick="pageChat.open(' + v.id + ')" i="' + v.id + '"' + (v._unseen > 0 ? ' class="highlightBackground"' : v._unseen2 > 0 ? ' class="unseen"' : '') + '><img src="' + v.image + '"' + (v.imageList ? '' : ' class="bgColor" style="padding:0.6em;"') + '/><span>' + v.pseudonym
						+ '<br/>' + global.date.formatDate(v._maxDate) + '</span><img source="' + (v._contactId == user.contact.id ? 'chatOut' : 'chatIn') + '" /></div>';
				}
				e.innerHTML = s;
				if (ui.cssValue(e, 'display') == 'none')
					e.removeAttribute('h');
				if (d.length > 1)
					e.setAttribute('firstChatId', model.convert(new Contact(), d, 1)._chatId);
				formFunc.image.replaceSVGs();
			}
		};
		f.call();
	}
	static open(id) {
		if (id.indexOf && id.indexOf('_') > 0)
			id = id.substring(0, id.indexOf('_'));
		var e = ui.q('chat[i="' + id + '"]');
		if (e) {
			if (ui.cssValue(e, 'display') == 'none') {
				pageChat.saveDraft();
				ui.html('chat', '');
			} else {
				pageChat.close();
				return;
			}
		}
		communication.ajax({
			url: global.server + 'action/chat/' + id + '/true',
			responseType: 'json',
			success(r) {
				if (!r || r.length < 1)
					return;
				ui.attr('chat', 'from', ui.navigation.getActiveID());
				var f = function () {
					var e = ui.q('chat');
					ui.html(e, '<listHeader><chatName><img/><span></span></chatName><chatDate></chatDate></listHeader><div></div>');
					communication.ajax({
						url: global.server + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + id),
						responseType: 'json',
						success(r2) {
							ui.attr('chat[i="' + id + '"] listHeader chatName', 'onclick', 'ui.navigation.autoOpen("' + global.encParam('p=' + id) + '",event)');
							ui.html('chat[i="' + id + '"] listHeader chatName span', r2['contact.pseudonym']);
							if (r2['contact.imageList'])
								ui.attr('chat[i="' + id + '"] listHeader img', 'src', global.serverImg + r2['contact.imageList']);
							else {
								var e2 = ui.q('chat[i="' + id + '"] listHeader img');
								ui.attr(e2, 'src', 'images/contact.svg');
								ui.classAdd(e2, 'bgColor');
								ui.css(e2, 'padding', '0.6em');
							}
						}
					});
					communication.notification.close();
					ui.navigation.hideMenu();
					ui.navigation.hidePopup();
					pageChat.closeList();
					pageChat.init();
					ui.off('chatConversation', 'scroll', pageChat.reposition);
					pageChat.detailChat(r, id);
					ui.on('chatConversation', 'scroll', pageChat.reposition);
					ui.css('chatConversation', 'opacity', 0);
					ui.navigation.animation('chat', 'slideDown',
						function () {
							pageChat.adjustTextarea(ui.q('#chatText'));
							var e = ui.q('chatConversation');
							if (e.children && e.children.length)
								e.scrollTop = e.children[e.children.length - 1].offsetTop;
							ui.css('chatConversation', 'opacity', 1);
						});
				}
				if (ui.cssValue('chat', 'display') == 'none')
					f.call();
				else
					pageChat.close(null, f);
			}
		});
	}
	static openGroup() {
		if (user.contact.groups == null) {
			pageContact.groups.getGroups(pageChat.openGroup);
			return;
		}
		if (user.contact.groups) {
			ui.navigation.hideMenu();
			var s = '<div class="smilyBox" style="margin-bottom:1em;"><buttontext onclick="pageChat.insertLinkInGroup()" class="bgColor" style="margin:1em;">' + ui.l('share') + '</buttontext><buttontext class="bgColor" onclick="pageChat.sendChatGroup()">' + ui.l('send') + '</buttontext></div>';
			var v = user.contact.chatTextGroups;
			if (!v) {
				v = ui.q('[name="groupdialog"]:checked');
				if (v)
					v = global.separatorTech + v.value;
				else
					v = '';
			}
			v = v.split(global.separatorTech);
			var g = user.contact.groups;
			for (var i = 1; i < v.length; i++)
				g = g.replace('value="' + v[i] + '"', 'value="' + v[i] + '" checked="checked"');
			ui.navigation.openPopup(ui.l('chat.groupTitle'), '<div style="text-align:center;padding:1em 2em;">' + g + '<br/><textarea placeholder="' + ui.l('chat.textHint') + '" style="height:20em;" id="groupChatText">' + v[0] + '</textarea>' + s + '<popupHint></popupHint></div>', 'pageChat.saveGroupText()');
		} else
			ui.navigation.openPopup(ui.l('chat.groupTitle'), lists.getListNoResults(ui.navigation.getActiveID(), 'noGroups'));
	}
	static postSendChatImage(r) {
		if (ui.q('chat').getAttribute('i') == r.contactId) {
			ui.q('[name="image"]').value = '';
			ui.navigation.hidePopup();
			setTimeout(function () {
				if (ui.q('chat[i="' + r.contactId + '"] chatConversation')) {
					communication.ajax({
						url: global.server + 'db/one?query=contact_chat&search=' + encodeURIComponent('chat.id=' + r.chatId),
						responseType: 'json',
						success(r2) {
							var e = document.createElement('div');
							e.innerHTML = pageChat.renderMsg(model.convert(new ContactChat(), r2));
							ui.q('chat[i="' + r.contactId + '"] chatConversation').insertBefore(e.children[0], null);
							pageChat.scrollToBottom();
						}
					});
				}
			}, 1000);
		}
	}
	static refresh() {
		pageChat.initActiveChats();
		var e = ui.q('chat[i]');
		if (e) {
			var id = e.getAttribute('i');
			communication.ajax({
				url: global.server + 'action/chat/false/' + id + '/false',
				responseType: 'json',
				success(r) {
					if (ui.q('chat[i="' + id + '"] chatConversation')) {
						var e = ui.q('chat[i="' + id + '"] chatConversation');
						if (!e)
							return;
						var showButton = e.scrollTop + e.clientHeight < e.scrollHeight;
						for (var i = 1; i < r.length; i++) {
							var v = model.convert(new ContactChat(), r, i);
							var f = ui.q('chat chatMessage');
							if (ui.classContains(f, 'me'))
								ui.classAdd(f, 'following');
							e.innerHTML = e.innerHTML + pageChat.renderMsg(v);
						}
						if (showButton)
							pageChat.showScrollButton();
						else
							pageChat.scrollToBottom();
					}
				}
			});
		}
	}
	static refreshActiveChat(unseen) {
		var e = ui.q('chat[i]');
		if (e && !unseen[e.getAttribute('i')])
			ui.classRemove('chat[i="' + e.getAttribute('i') + '"] .highlightColor', 'highlightColor');
	}
	static renderMsg(v) {
		var date = global.date.formatDate(v.createdAt);
		v.time = date.substring(date.lastIndexOf(' ') + 1);
		v.class = '';
		if (v.contactId == user.contact.id) {
			v.class = ' class="me"';
			if (!v.seen)
				v.classUnseen = ' class="highlightColor"';
		} else if (v._pseudonym) {
			v.oc = ' onclick="ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.contactId) + '&quot;,event)"';
			v.time = '<span' + v.oc + '>' + v._pseudonym + ' ' + v.time + '</span>';
		}
		if (v.image)
			v.note = '<note style="padding:0;"><img src="' + global.serverImg + v.image + '"/></note>';
		else
			v.note = '<note' + (v.oc ? v.oc : '') + '>' + pageChat.formatTextMsg(v) + '</note>';
		return (v.dateTitle ? v.dateTitle : '') + pageChat.templateMessage(v);
	}
	static reposition() {
		var e = ui.qa('chatDateTitle'), cc = ui.q('chatConversation');
		if (e.length && cc) {
			var date;
			for (var i = 0; i < e.length; i++) {
				if (cc.scrollTop < e[i].offsetTop && date)
					break;
				date = e[i].innerHTML;
			}
			ui.html('chat chatDate', date);
			e = ui.q('chatConversation');
			if (!e.lastChild || e.lastChild.offsetHeight + e.lastChild.offsetTop == e.scrollTop + e.offsetHeight)
				pageChat.lastScroll = new Date().getTime();
		}
	}
	static reset() {
		pageChat.chatsNew = 0;
		pageChat.chatsUnseen = 0;
		pageChat.copyLink = '';
		ui.html('chatList', '');
	}
	static saveDraft() {
		var e = ui.q('#chatText');
		if (e)
			formFunc.saveDraft('chat' + ui.q('chat').getAttribute('i'), pageChat.oldCleverTip == e.value ? null : e.value);
	}
	static saveGroupText() {
		user.contact.chatTextGroups = ui.val('#groupChatText');
		var e = ui.qa('input[name="groupdialog"]:checked');
		for (var i = 0; i < e.length; i++)
			user.contact.chatTextGroups += global.separatorTech + e[i].value;
	}
	static scrollToBottom() {
		var e = ui.q('chatConversation');
		if (e) {
			var e2 = ui.qa('chatConversation > *');
			if (e2.length) {
				ui.scrollTo(e, e2[e2.length - 1].offsetTop + e2[e2.length - 1].offsetHeight);
				e2 = ui.q('chatList [i="' + ui.q('chat').getAttribute('i') + '"] badge');
				ui.html(e2, '0');
				ui.css(e2, 'display', 'none');
			}
			e2 = ui.q('chatMoreButton');
			if (e2.style.display != 'none')
				ui.navigation.animation(e2, 'homeSlideOut', function () {
					ui.css(e2, 'display', 'none');
				});
		}
	}
	static sendChat(id, msg, event) {
		if (event)
			try {
				event.preventDefault();
			} catch (e) { }
		if (!msg) {
			formFunc.validation.filterWords(ui.q('#chatText'));
			if (ui.q('chat errorHint'))
				return;
			msg = ui.val('#chatText');
		}
		if (msg) {
			var v = {
				note: msg.replace(/</g, '&lt;'),
				contactId2: id
			};
			communication.ajax({
				url: global.server + 'db/one',
				method: 'POST',
				body: {
					classname: 'ContactChat',
					values: v
				},
				error(r) {
					r = JSON.parse(r.response);
					if (r.class == 'IllegalArgumentException' && r.msg == 'duplicate chat') {
						ui.q('#chatText').value = '';
						pageChat.adjustTextarea(ui.q('#chatText'));
						formFunc.removeDraft('chat' + id);
					} else
						communication.onError(r);
				},
				success(r) {
					if (ui.q('chat[i="' + id + '"] chatConversation')) {
						v.createdAt = new Date();
						v.id = r;
						v.contactId = user.contact.id;
						var e = ui.q('chat[i="' + id + '"] chatConversation');
						e.innerHTML = e.innerHTML + pageChat.renderMsg(v);
						pageChat.scrollToBottom();
						if (v.note) {
							ui.q('#chatText').value = '';
							pageChat.adjustTextarea(ui.q('#chatText'));
							formFunc.removeDraft('chat' + id);
						}
					}
					pageChat.initActiveChats();
				}
			});
		}
	}
	static sendChatGroup() {
		var e = ui.qa('popup input[name="groupdialog"]:checked');
		var s = '';
		for (var i = 0; i < e.length; i++)
			s += ',' + e[i].value;
		if (s && ui.val('#groupChatText')) {
			communication.ajax({
				url: global.server + 'action/chatGroups',
				method: 'POST',
				body: 'groups=' + s.substring(1) + '&text=' + encodeURIComponent(ui.val('#groupChatText')),
				success() {
					ui.navigation.hidePopup();
					user.contact.chatTextGroups = '';
					pageChat.initActiveChats();
				}
			});
		} else
			ui.html('popupHint', ui.l('chat.groupNoInput'));
	}
	static sendChatImage() {
		if (formFunc.image.hasImage('image')) {
			var id = ui.q('chat').getAttribute('i');
			var v = formFunc.getForm('popup form');
			v.classname = 'ContactChat';
			communication.ajax({
				url: global.server + 'db/one',
				method: 'POST',
				body: v,
				error(r) {
					r = JSON.parse(r.response);
					if (r.class != 'IllegalArgumentException' || r.msg != 'duplicate chat')
						communication.onError(r);
				},
				success(chatId) {
					pageChat.postSendChatImage({ contactId: id, chatId: chatId, });
					pageChat.initActiveChats();
				}
			});
		} else
			ui.navigation.hidePopup();
	}
	static showScrollButton() {
		var e = ui.q('chatMoreButton');
		ui.css(e, 'display', 'block');
		ui.navigation.animation(e, 'homeSlideIn');
		ui.on('chatConversation', 'scroll', function () {
			ui.navigation.animation(e, 'homeSlideOut', function () {
				ui.css(e, 'display', 'none');
			});
		}, true);
	}
	static toggleInsertCopyLinkEntry(id) {
		var e = ui.q('popup [insertID="' + id + '"]');
		if (ui.classContains(e, 'pressed'))
			ui.classRemove(e, 'pressed');
		else
			ui.classAdd(e, 'pressed');
	}
	static toggleUserList() {
		if (ui.q('chatList>div')) {
			if (ui.q('chatList').style.display == 'none')
				pageHome.closeList();
			ui.toggleHeight('chatList');
		} else if (user.contact)
			intro.openHint({ desc: 'chatEmpty', pos: '0.5em,-7em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:1em;' });
		else
			intro.openHint({ desc: 'chatDescription', pos: '0.5em,-7em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:1em;' });
	}
};
