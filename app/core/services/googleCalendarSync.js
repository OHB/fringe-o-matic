angular.module('fringeApp')
    .service('GoogleCalendarSync', ['Data', 'User', '$q', 'debounce', function(Data, User, $q, debounce) {
        var self = this,
            calendarScope = 'https://www.googleapis.com/auth/calendar',
            onSyncStartFn = function() {},
            getCurrentUser = function() {
                return gapi.auth2.getAuthInstance().currentUser.get();
            };

        var getSyncCalendarId = function() {
            var settings = User.getSettings();

            return settings.googleCalendarSyncId || null;
        };

        var sync = function() {
            if (! self.isSetup()) {
                return $q.when();
            }

            var calendarId = getSyncCalendarId(),
                deferred = $q.defer(),
                eventReminders = '<br /><p><strong>Remember to arrive 10 minutes prior to showtime and to wear your Fringe button!</strong></p>';

            onSyncStartFn(deferred.promise);

            gapi.client.calendar.events.list({
                calendarId: calendarId,
                privateExtendedProperty: 'fringeSeason=OrlandoMay2018',
                maxResults: 500
            }).then(function(response) {
                var existingPerformanceToEventMap = {},
                    existingCalendarItems = response.result.items.map(function(item) {
                        existingPerformanceToEventMap[item.extendedProperties.private.performanceId] = item.id;
                        return item.extendedProperties.private.performanceId;
                    }),
                    itemsToSend = User.getSchedule().diff(existingCalendarItems),
                    itemsToDelete = existingCalendarItems.diff(User.getSchedule()),
                    total = itemsToSend.length + itemsToDelete.length,
                    progress = 0;

                deferred.notify({progress: 0, max: total});

                $q.serial([
                    function() {
                        return $q.serial(itemsToSend.map(function(performanceId) {
                            return function() {
                                var performance = Data.getPerformance(performanceId),
                                    show = Data.getShow(performance.show),
                                    venue = Data.getVenue(show.venue),
                                    venueHost = Data.getVenueHost(venue.host),
                                    location = venue.name + ' at ' + venueHost.name + ', ' + venueHost.address.join(', '),
                                    description = '<p>' + show.description + '</p>' +
                                        eventReminders +
                                        '<p><a href="https://fringeomatic.com/show/' + show.slug + '">Show Information</a><br />' +
                                        '<a href="http://fringeomatic.com/my-fringe">My Fringe</a></p>';

                                location = location.replace(venue.name + ' at ' + venue.name, venue.name);

                                return gapi.client.calendar.events.insert({
                                    calendarId: calendarId,
                                    resource: {
                                        summary: show.name,
                                        description: description,
                                        location: location,
                                        start: {dateTime: moment(performance.start, 'X').toISOString(), timeZone: 'America/New_York'},
                                        end: {dateTime: moment(performance.stop, 'X').toISOString(), timeZone: 'America/New_York'},
                                        extendedProperties: {
                                            private: {
                                                fringeSeason: 'OrlandoMay2018',
                                                performanceId: performanceId
                                            }
                                        },
                                        reminders: {
                                            useDefault: false,
                                            overrides: [{method: 'popup', minutes: 30}]
                                        },
                                        source: {
                                            title: 'Fringe-o-Matic',
                                            url: 'https://fringeomatic.com/show/' + show.slug
                                        },
                                        transparency: 'opaque'
                                    }
                                }).then(function() {
                                    deferred.notify({progress: ++ progress, max: total});
                                }, function() {
                                    deferred.notify({progress: ++ progress, max: total});
                                });
                            };
                        }))
                    },
                    function() {
                        return $q.serial(itemsToDelete.map(function(performanceId) {
                            return function() {
                                return gapi.client.calendar.events.delete({
                                    calendarId: calendarId,
                                    eventId: existingPerformanceToEventMap[performanceId]
                                }).then(function() {
                                    deferred.notify({progress: ++ progress, max: total});
                                }, function() {
                                    deferred.notify({progress: ++ progress, max: total});
                                });
                            };
                        }));
                    }
                ]).then(deferred.resolve);
            }, function(response) {
                if (response.status === 404) {
                    self.disconnect();
                }
            });

            return deferred.promise;
        };

        this.getCalendarLink = function() {
            return 'https://calendar.google.com/calendar/r?cid=' + getSyncCalendarId();
        };

        this.onSyncStart = function(fn) {
            onSyncStartFn = fn;
        };

        this.hasPermission = function() {
            return getCurrentUser().getGrantedScopes().indexOf(calendarScope) > -1;
        };

        this.requestPermission = function() {
            return getCurrentUser().grant(new gapi.auth2.SigninOptionsBuilder({'scope': calendarScope}));
        };

        this.isSetup = function() {
            return this.hasPermission() && getSyncCalendarId() !== null;
        };

        this.sync = debounce(sync, 2000);

        this.getCalendars = function() {
            return gapi.client.calendar.calendarList.list({
                minAccessRole: 'writer'
            }).then(function(response) {
                return response.result.items.map(function(item) {
                    return {
                        id: item.id,
                        name: item.summaryOverride || item.summary,
                        primary: item.primary === true,
                        style: {
                            backgroundColor: item.backgroundColor,
                            color: item.foregroundColor
                        }
                    };
                }).sort(function(a, b) {
                    return a.primary ? -1 : a.name.localeCompareSmart(b.name);
                });
            });
        };

        this.setupInNew = function(name) {
            return gapi.client.calendar.calendars.insert({
                summary: name,
                timeZone: 'America/New_York'
            }).then(function(response) {
                return self.setupInExisting(response.result.id);
            });
        };

        this.setupInExisting = function(calendarId) {
            var settings = User.getSettings();
            settings.googleCalendarSyncId = calendarId;
            User.setSettings(settings);

            return sync();
        };

        this.disconnect = function() {
            var settings = User.getSettings();
            settings.googleCalendarSyncId = null;
            User.setSettings(settings);
        };
    }]);