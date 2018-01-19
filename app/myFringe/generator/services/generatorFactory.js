angular.module('fringeApp').factory('generatorFactory', function() {
    var create = function() {
        var genetic = Genetic.create();

        genetic.optimize = Genetic.Optimize.Maximize;
        genetic.select1 = Genetic.Select1.RandomLinearRank;
        genetic.select2 = Genetic.Select2.RandomLinearRank;

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
                fitness = 0,
                conflicts = [],
                extraPoints = 0,
                schedule = unsortedSchedule.slice().sort(function sorter(a, b) {
                    var pa = that.userData.performances[a], pb = that.userData.performances[b];
                    return pb.start - pa.start || pb.stop - pa.stop;
                }),
                groups = [0, 0, 0, 0, 0];


            outerWhile: while (i --) {
                var p1 = this.userData.performances[schedule[i]],
                    show1 = this.userData.shows[p1.show],
                    desire1 = show1.desire,
                    conflictFound = false,
                    j = 0,
                    k = 0 ,
                    p2, show2;


                // minus is next!
                for (j = 1; j < l; j ++) {
                    k = i - j;

                    if (schedule[k] === undefined) {
                        break;
                    }

                    p2 = this.userData.performances[schedule[k]];
                    show2 = this.userData.shows[p2.show];

                    if (desire1 <= show2.desire && p2.start < p1.offsetTimes[show2.venue].stop) {
                        conflicts.push(p1.show);
                        conflictFound = true;
                        continue outerWhile;
                    } else if (p2.start > p1.stop + 3000) {
                        break;
                    }
                }

                for (j = 1; j < l; j ++) {
                    k = i + j;

                    if (schedule[k] === undefined) {
                        break;
                    }

                    p2 = this.userData.performances[schedule[k]];
                    show2 = this.userData.shows[p2.show];

                    if (desire1 <= show2.desire && p2.stop > p1.offsetTimes[show2.venue].start) {
                        conflicts.push(p1.show);
                        conflictFound = true;
                        continue outerWhile;
                    } else if (p2.stop < p1.start - 3000) {
                        break;
                    }
                }

                if (! conflictFound) {
                    fitness += this.userData.desireToFitnessMap[desire1];

                    if (schedule[i + 1] !== undefined) {
                        var s = schedule[i + 1];
                        if (this.userData.adjacentVenueThreshold > this.userData.venueDistances[show1.venue][this.userData.shows[this.userData.performances[s].show].venue]) {
                            extraPoints += this.userData.extraPointsForAdjacentVenues;
                        }

                        // extra points for time off
                        extraPoints += Math.floor((p1.start - this.userData.performances[s].stop) / this.userData.timeOffThreshold) * this.userData.extraPointsForTimeOff;
                    }

                    groups[desire1] ++;
                }
            }

            fitness += extraPoints;

            return returnDetails ? {
                fitness: fitness,
                groups: groups,
                extraPoints: extraPoints,
                conflicts: conflicts
            } : fitness;
        };

        genetic.generation = function generation(pop) {
            if (pop[0].fitness >= this.userData.idealFitness) {
                if (pop[0].fitness - this.fitness(pop[0].entity, true).extraPoints >= this.userData.idealFitness) {
                    // return false;
                }
            }
            return true;
        };

        return genetic;
    };

    return {
        create: create
    };
});