import { communication } from './communication';

export { model, Contact, ContactLink, Location, ContactNotification, EventParticipate, LocationFavorite, Event, EventRating, Block, ContactChat, ContactVisit, ContactGroup, ContactGroupLink };

class model {
	static reportedErrors = {};
	static convert(object, list, index) {
		var keys, object2Transform, objectName;
		if (index) {
			if (index >= list.length)
				return object;
			keys = list[0];
			object2Transform = list[index];
		} else {
			keys = Object.keys(list);
			object2Transform = [];
			for (var i = 0; i < keys.length; i++)
				object2Transform.push(list[keys[i]]);
		}
		for (var i = 0; i < keys.length; i++) {
			var o = object, key = keys[i];
			if (key.indexOf('.') == 0)
				key = key.substring(1);
			key = key.split('.');
			for (var i2 = 0; i2 < key.length; i2++) {
				if (i2 == 0 && !o.hasOwnProperty(key[0]) && key.length > 0 && o.hasOwnProperty(key[1]) && key[0]) {
					if (!objectName)
						objectName = key[0];
					if (objectName == key[0])
						i2++;
				}
				if (key[i2].indexOf('_') != 0 && !o.hasOwnProperty(key[i2]) && (i2 > 0 || (key[0].indexOf('location') != 0 && key[0].indexOf('contact') != 0)) && !model.reportedErrors[keys[i]]) {
					var s = '';
					for (var i3 = 0; i3 < keys.length; i3++)
						s += '\n' + keys[i3] + '=' + object2Transform[keys[i3]];
					communication.sendError('model.convert: property ' + keys[i] + ' not found, available properties\n' + Object.keys(object) + '\nserver object:' + s);
					model.reportedErrors[keys[i]] = 1;
				}
				if (i2 < key.length - 1) {
					o = o[key[i2]];
					if (!o)
						break;
				} else if (o)
					o[key[i2]] = object2Transform[i];
			}
		}
		return object;
	}
}

class BaseEntity {
	createdAt;
	id;
	modifiedAt;
}

class Block extends BaseEntity {
	note;
	reason;
}

class Contact extends BaseEntity {
	aboutMe;
	active;
	age;
	ageDivers;
	ageFemale;
	ageMale;
	birthday;
	birthdayDisplay;
	bluetooth;
	gender;
	idDisplay;
	image;
	imageList;
	language;
	latitude;
	longitude;
	notificationBirthday;
	notificationChat;
	notificationEngagement;
	notificationFriendRequest;
	notificationMarkEvent;
	notificationVisitLocation;
	notificationVisitProfile;
	paypalMerchantId;
	pseudonym;
	rating;
	search;
	skills;
	skillsText;
	state;
	storage;
	urls;
	verified;
	visitPage;

	block = new Block();
	contactGroupLink = new ContactGroupLink();
	contactLink = new ContactLink();
	contactNotification = new ContactNotification();
	contactVisit = new ContactVisit();
	event = new Event();
	eventParticipate = new EventParticipate();
}

class ContactGroup extends BaseEntity {
	contactId;
	name;
}

class ContactGroupLink extends BaseEntity {
	contactGroupId;
	contactId2;
}

class ContactLink extends BaseEntity {
	contactId;
	contactId2;
	status;
}

class ContactNotification extends BaseEntity {
	action;
	contactId;
	contactId2;
	seen;
	text;
}

class ContactVisit extends BaseEntity {
	count;
}

class ContactChat extends BaseEntity {
	action;
	contactId;
	contactId2;
	image;
	note;
	seen;
	textId;
}

class Event extends BaseEntity {
	category;
	confirm;
	contactId;
	endDate;
	image;
	imageList;
	link;
	locationId;
	maxParticipants;
	price;
	startDate;
	skills;
	skillsText;
	text;
	type;
	visibility;
}

class EventParticipate extends BaseEntity {
	contactId;
	eventDate;
	eventId;
	reason;
	state;
}

class EventRating extends BaseEntity {
	contactId;
	eventId;
	image;
	rating;
	text;

	contact = new Contact();
}

class Location extends BaseEntity {
	address;
	contactId;
	description;
	image;
	imageList;
	latitude;
	longitude;
	name;
	rating;
	telephone;
	town;

	block = new Block();
	contact = new Contact();
	contactLink = new ContactLink();
	event = new Event();
	eventParticipate = new EventParticipate();
	locationFavorite = new LocationFavorite();
}

class LocationFavorite extends BaseEntity {
	favorite;
}