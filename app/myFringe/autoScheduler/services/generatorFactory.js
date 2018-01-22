angular.module('fringeApp').factory('generatorFactory', function() {
    var create = function() {
        var genetic = Genetic.create();

        genetic.optimize = Genetic.Optimize.Maximize;
        // genetic.select1 = Genetic.Select1.RandomLinearRank;
        // genetic.select2 = Genetic.Select2.RandomLinearRank;

        genetic.seed = function () {
            var schedule = [],
                j = this.userData.showIds.length;

            while (j --) {
                var performances = this.userData.shows[this.userData.showIds[j]].performances;
                schedule.push(performances[Math.floor(Math.random() * performances.length)]);
            }

            return schedule;
        };

        genetic.mutate = function mutate(schedule) {
            var i = schedule.length,
                toMake = 2 || Math.floor((Math.random() * 2) + 1);

            while (i --) {
                var idx = Math.floor(Math.random() * schedule.length),
                    performances = this.userData.shows[this.userData.performances[schedule[idx]].show].performances,
                    l = performances.length;

                if (l > 1) {
                    schedule[idx] = performances[Math.floor(Math.random() * performances.length)];
                    toMake --;

                    if (toMake === 0) {
                        break;
                    }
                }
            }

            return schedule;
        };

        genetic.crossover = function crossover(mother, father) {
            var len = mother.length;
            var ca = Math.floor(Math.random() * len);
            var cb = Math.floor(Math.random() * len);
            if (ca > cb) {
                var tmp = cb;
                cb = ca;
                ca = tmp;
            }

            return [
                mother.slice(0, ca).concat(father.slice(ca, cb)).concat(mother.slice(cb)),
                father.slice(0, ca).concat(mother.slice(ca, cb)).concat(father.slice(cb))
            ];
        };

        genetic.fitness = function fitness(unsortedSchedule, returnDetails) {
            var that = this,
                i = unsortedSchedule.length,
                l = i,
                j = 0,
                k = 0,
                conflictFound = false,
                fitness = 0,
                conflictsByDesire = [[], [], [], [], []],
                conflicts = [],
                extraPoints = 0,
                schedule = unsortedSchedule.slice().sort(function sorter(a, b) {
                    var pa = that.userData.performances[a], pb = that.userData.performances[b];
                    return pb.start - pa.start || pb.stop - pa.stop;
                }),
                groups = [0, 0, 0, 0, 0],
                p1, p2, show1, show2,
                tudPerformances = this.userData.performances,
                tudShows = this.userData.shows,
                debugInfo = {};

            outerWhile: while (i --) {
                p1 = tudPerformances[schedule[i]];
                show1 = tudShows[p1.show];
                conflictFound = false;
                j = 0;
                k = 0;

                var desire1 = show1.desire;



                // minus is next!
                for (j = 1; j < l; j ++) {
                    k = i - j;

                    if (schedule[k] === undefined) {
                        break;
                    }

                    p2 = tudPerformances[schedule[k]];
                    show2 = tudShows[p2.show];

                    if (desire1 <= show2.desire && p2.start < p1.offsetTimes[show2.venue].stop) {
                        conflictsByDesire[show1.desire].push(p1.show);
                        conflicts.push(p1.show);
                        conflictFound = true;
                        continue outerWhile;
                    } else if (p2.start > p1.stop + 3000) {
                        break;
                    }
                }

                // plus is previous!
                for (j = 1; j < l; j ++) {
                    k = i + j;

                    if (schedule[k] === undefined) {
                        break;
                    }

                    p2 = tudPerformances[schedule[k]];
                    show2 = tudShows[p2.show];

                    if (desire1 <= show2.desire && p2.stop > p1.offsetTimes[show2.venue].start) {
                        conflictsByDesire[show1.desire].push(p1.show);
                        conflicts.push(p1.show);
                        conflictFound = true;
                        continue outerWhile;
                    } else if (p2.stop < p1.start - 3000) {
                        break;
                    }
                }

                if (! conflictFound) {
                    fitness += this.userData.desireToFitnessMap[desire1];
                    groups[desire1] ++;
                }
            }

            schedule = schedule.filter(function(pId) {
                return conflicts.indexOf(tudPerformances[pId].show) === -1;
            });

            if (false && conflicts.length) {
                var notConflicts = [];

                for (i = 5; --i;) {
                    for (j = 0; j < conflicts.length; j ++) {
                        if (conflictsByDesire[i].indexOf(this.userData.showIds[j]) === -1) {
                            continue;
                        }

                        // a conflict to resolve (this is a show)
                        show1 = tudShows[this.userData.showIds[j]];

                        // for each show performance
                        forEachShowPerformance: for (k = 0; k < show1.performances.length; k ++) {
                            p1 = tudPerformances[show1.performances[k]];

                            // if it conflicts with something in schedule that isn't a conflict, continue
                            for (var n = 0; n < schedule.length; n ++) {
                                p2 = tudPerformances[schedule[n]];
                                show2 = tudShows[p2.show];

                                if (! (p2.start > p1.offsetTimes[show2.venue].stop || p2.stop < p1.offsetTimes[show2.venue].start)) {
                                    continue forEachShowPerformance;
                                }
                            }

                            schedule.push(show1.performances[k]);
                            fitness += this.userData.desireToFitnessMap[i];
                            groups[i] ++;
                            notConflicts.push(p1.show);

                            break;
                        }
                    }
                }

                // for each notConflicts
                for (i = 0; i < notConflicts.length; i ++) {
                    // remove from conflicts
                    conflicts.splice(conflicts.indexOf(notConflicts[i]), 1);
                }

                schedule.sort(function sorter(a, b) {
                    var pa = that.userData.performances[a], pb = that.userData.performances[b];
                    return pb.start - pa.start || pb.stop - pa.stop;
                });
            }

            // assign extra points
            i = schedule.length - 1;
            while (i --) {
                p1 = tudPerformances[schedule[i]];
                p2 = tudPerformances[schedule[i + 1]];

                if (this.userData.adjacentVenueThreshold > this.userData.venueDistances[tudShows[p1.show].venue][tudShows[p2.show].venue]) {
                    extraPoints += this.userData.extraPointsForAdjacentVenues;
                }

                // extra points for time off
                extraPoints += Math.floor((p1.start - p2.stop) / this.userData.timeOffThreshold) * this.userData.extraPointsForTimeOff;
            }

            fitness += extraPoints;

            return returnDetails ? {
                fitness: fitness,
                groups: groups,
                extraPoints: extraPoints,
                conflicts: conflicts
            } : fitness;
        };

        genetic.generation = function generation(pop, generation) {
            if (this.userData.genState === undefined || this.userData.genState.lastFitness < pop[0].fitness) {
                this.userData.genState = {
                    lastFitness: pop[0].fitness,
                    sinceGeneration: generation
                };

                return true;
            }

            return generation - this.userData.genState.sinceGeneration <= 100;
        };

        return genetic;
    };

    return {
        create: create
    };
});