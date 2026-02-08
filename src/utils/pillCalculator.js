import { FLOAT_TOLERANCE, FULL_THAI_DAYS } from './constants';

// Find pill combinations for a target dose
export function findComb(target, availablePills, allowHalf, allowQuarter, minPillObjects = 1, maxPillObjects = 4) {
    if (Math.abs(target) < FLOAT_TOLERANCE) return [[]];
    const combinations = [];

    function backtrack(remaining, currentCombo, pillIndex, objectCount) {
        if (Math.abs(remaining) < FLOAT_TOLERANCE) {
            if (objectCount >= minPillObjects) {
                const aggregated = aggregateCombo(currentCombo);
                if (aggregated.length > 0) combinations.push(aggregated);
            }
            return;
        }
        if (pillIndex >= availablePills.length || objectCount >= maxPillObjects || remaining < -FLOAT_TOLERANCE) return;
        const pillMg = availablePills[pillIndex];

        backtrack(remaining, currentCombo, pillIndex + 1, objectCount);

        const maxFullPills = Math.min(3, Math.floor((remaining + FLOAT_TOLERANCE) / pillMg));
        for (let count = 1; count <= maxFullPills; count++) {
            if (objectCount + count > maxPillObjects) continue;
            const remainingAfterFull = remaining - (pillMg * count);
            currentCombo.push({ mg: pillMg, half: false, quarter: false, count: count });
            backtrack(remainingAfterFull, currentCombo, pillIndex + 1, objectCount + count);
            if (allowHalf && objectCount + count + 1 <= maxPillObjects) {
                const halfDose = pillMg / 2;
                if (remainingAfterFull >= halfDose - FLOAT_TOLERANCE) {
                    currentCombo.push({ mg: pillMg, half: true, quarter: false, count: 1 });
                    backtrack(remainingAfterFull - halfDose, currentCombo, pillIndex + 1, objectCount + count + 1);
                    currentCombo.pop();
                }
            }
            if (allowQuarter && objectCount + count + 1 <= maxPillObjects) {
                const quarterDose = pillMg / 4;
                if (remainingAfterFull >= quarterDose - FLOAT_TOLERANCE) {
                    currentCombo.push({ mg: pillMg, half: false, quarter: true, count: 1 });
                    backtrack(remainingAfterFull - quarterDose, currentCombo, pillIndex + 1, objectCount + count + 1);
                    currentCombo.pop();
                }
            }
            currentCombo.pop();
        }
        if (allowHalf && objectCount + 1 <= maxPillObjects) {
            const halfDose = pillMg / 2;
            if (remaining >= halfDose - FLOAT_TOLERANCE) {
                currentCombo.push({ mg: pillMg, half: true, quarter: false, count: 1 });
                backtrack(remaining - halfDose, currentCombo, pillIndex + 1, objectCount + 1);
                currentCombo.pop();
            }
        }
        if (allowQuarter && objectCount + 1 <= maxPillObjects) {
            const quarterDose = pillMg / 4;
            if (remaining >= quarterDose - FLOAT_TOLERANCE) {
                currentCombo.push({ mg: pillMg, half: false, quarter: true, count: 1 });
                backtrack(remaining - quarterDose, currentCombo, pillIndex + 1, objectCount + 1);
                currentCombo.pop();
            }
        }
    }
    backtrack(target, [], 0, 0);
    return filterAndOptimizeCombinations(combinations);
}

function aggregateCombo(combo) {
    if (!combo) return [];
    const aggregated = {};
    combo.forEach(pill => {
        const key = `${pill.mg}-${pill.half}-${pill.quarter}`;
        if (!aggregated[key]) aggregated[key] = { ...pill, count: 0 };
        aggregated[key].count += pill.count;
    });
    return Object.values(aggregated);
}

function filterAndOptimizeCombinations(combinations) {
    const uniqueCombos = new Set();
    return combinations.filter(combo => {
        const key = combo.map(p => `${p.mg}${p.quarter ? 'q' : p.half ? 'h' : 'f'}x${p.count}`).sort().join('|');
        if (uniqueCombos.has(key)) return false;
        uniqueCombos.add(key);
        return true;
    }).map(combo => combo.sort((a, b) => b.mg - a.mg));
}

function createOptionKey(combos) {
    return combos.map(c => c.length === 0 ? 's' : c.map(p => `${p.mg}${p.half ? 'h' : p.quarter ? 'q' : 'f'}x${p.count}`).sort().join(',')).join('|');
}

function createNonUniformOption(baseDose, specialDose, normalCombo, specialCombo, skipDays, specialDays, pattern) {
    const dailyDoses = new Array(7).fill(0);
    const combos = new Array(7).fill([]);
    const specialDaysRef = (pattern === 'weekend') ? [0, 6, 5] : [5, 3, 1];
    const skipIndices = specialDaysRef.slice(0, skipDays);
    const specialIndices = specialDaysRef.slice(skipDays, skipDays + specialDays);

    for (let i = 0; i < 7; i++) {
        if (skipIndices.includes(i)) continue;
        if (specialIndices.includes(i)) {
            dailyDoses[i] = specialDose;
            combos[i] = specialCombo;
        } else {
            dailyDoses[i] = baseDose;
            combos[i] = normalCombo;
        }
    }
    return { type: 'non-uniform', dailyDoses, combos, complexity: skipDays + specialDays };
}

function countUniqueMethods(combos) {
    const methodKeys = new Set();
    combos.forEach(combo => {
        if (!combo || combo.length === 0) {
            methodKeys.add('stop');
        } else {
            const key = combo.map(p => `${p.mg}${p.quarter ? 'q' : p.half ? 'h' : 'f'}x${p.count}`).sort().join('|');
            methodKeys.add(key);
        }
    });
    return methodKeys.size;
}

function calculateDoseVariance(dailyDoses) {
    if (!dailyDoses || dailyDoses.length === 0) return 0;
    const mean = dailyDoses.reduce((a, b) => a + b, 0) / dailyDoses.length;
    return dailyDoses.reduce((sum, dose) => sum + Math.pow(dose - mean, 2), 0);
}

function countTotalSplitPills(combos) {
    return combos.flat().reduce((sum, pill) => {
        if (pill.half || pill.quarter) {
            return sum + (pill.count || 0);
        }
        return sum;
    }, 0);
}

function countPillTypes(combos) {
    return new Set(combos.flat().map(p => p.mg)).size;
}

function countTotalObjects(combos) {
    return combos.flat().reduce((sum, p) => sum + p.count, 0);
}

// Generate all dose options
export function generateOptions(weeklyDose, allowHalf, allowQuarter, specialPattern, availablePills) {
    if (availablePills.length === 0) {
        return [];
    }

    const options = [];
    const optionKeys = new Set();
    const dailyDoseTarget = weeklyDose / 7;

    // Uniform doses (same every day)
    findComb(dailyDoseTarget, availablePills, allowHalf, allowQuarter).forEach(combo => {
        if (combo.length > 0) {
            const dailyDoses = new Array(7).fill(dailyDoseTarget);
            const combos = new Array(7).fill(combo);
            const key = createOptionKey(combos);
            if (!optionKeys.has(key)) {
                optionKeys.add(key);
                options.push({ type: 'uniform', dailyDoses, combos, complexity: 0 });
            }
        }
    });

    // Non-uniform doses
    for (let skipDays = 0; skipDays <= 3; skipDays++) {
        for (let specialDays = 0; specialDays <= (3 - skipDays); specialDays++) {
            const normalDaysCount = 7 - skipDays - specialDays;
            if (normalDaysCount <= 0) continue;

            for (let baseDose = 0.5; baseDose <= 15; baseDose += 0.5) {
                const remainingDose = weeklyDose - baseDose * normalDaysCount;
                const normalCombos = findComb(baseDose, availablePills, allowHalf, allowQuarter);
                if (normalCombos.length === 0) continue;

                if (specialDays === 0) {
                    if (Math.abs(remainingDose) < FLOAT_TOLERANCE) {
                        normalCombos.forEach(nc => {
                            const option = createNonUniformOption(baseDose, 0, nc, [], skipDays, specialDays, specialPattern);
                            if (option) {
                                const key = createOptionKey(option.combos);
                                if (!optionKeys.has(key)) {
                                    optionKeys.add(key);
                                    options.push(option);
                                }
                            }
                        });
                    }
                } else {
                    const specialDoseTarget = remainingDose / specialDays;
                    if (specialDoseTarget > 0 && Math.abs(specialDoseTarget - baseDose) > FLOAT_TOLERANCE && specialDoseTarget <= 15) {
                        const specialCombos = findComb(specialDoseTarget, availablePills, allowHalf, allowQuarter);
                        normalCombos.forEach(nc => specialCombos.forEach(sc => {
                            const option = createNonUniformOption(baseDose, specialDoseTarget, nc, sc, skipDays, specialDays, specialPattern);
                            if (option) {
                                const key = createOptionKey(option.combos);
                                if (!optionKeys.has(key)) {
                                    optionKeys.add(key);
                                    options.push(option);
                                }
                            }
                        }));
                    }
                }
            }
        }
    }

    // Calculate and sort
    options.forEach(opt => {
        opt.doseVariance = calculateDoseVariance(opt.dailyDoses);
        opt.totalSplits = countTotalSplitPills(opt.combos);
        opt.uniqueMethods = countUniqueMethods(opt.combos);
    });

    options.sort((a, b) => {
        const aIsSimple = a.uniqueMethods <= 2;
        const bIsSimple = b.uniqueMethods <= 2;
        if (aIsSimple !== bIsSimple) return aIsSimple ? -1 : 1;
        const aHasSplits = a.totalSplits > 0;
        const bHasSplits = b.totalSplits > 0;
        if (aHasSplits !== bHasSplits) return aHasSplits ? 1 : -1;
        const varianceDiff = a.doseVariance - b.doseVariance;
        if (Math.abs(varianceDiff) > 0.001) return varianceDiff;
        const splitCountDiff = a.totalSplits - b.totalSplits;
        if (splitCountDiff !== 0) return splitCountDiff;
        const methodCountDiff = a.uniqueMethods - b.uniqueMethods;
        if (methodCountDiff !== 0) return methodCountDiff;
        const complexityDiff = a.complexity - b.complexity;
        if (complexityDiff !== 0) return complexityDiff;
        const pillTypesDiff = countPillTypes(a.combos) - countPillTypes(b.combos);
        if (pillTypesDiff !== 0) return pillTypesDiff;
        return countTotalObjects(a.combos) - countTotalObjects(b.combos);
    });

    return options;
}

// Group consecutive days
export function groupConsecutiveDays(days) {
    if (days.length === 0) return [];

    const sorted = [...days].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));

    const groups = [];
    if (sorted.length > 0) {
        let currentGroup = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            const prev = currentGroup[currentGroup.length - 1];
            const current = sorted[i];

            if ((current === 0 && prev === 6) || current === prev + 1) {
                currentGroup.push(current);
            } else {
                groups.push(currentGroup);
                currentGroup = [current];
            }
        }
        groups.push(currentGroup);
    }
    return groups;
}

// Format day groups to text
export function formatDayGroups(dayGroups) {
    return dayGroups.map(group => {
        if (group.length === 1) {
            return `วัน${FULL_THAI_DAYS[group[0]]}`;
        }
        return `วัน${FULL_THAI_DAYS[group[0]]} ถึง วัน${FULL_THAI_DAYS[group[group.length - 1]]}`;
    }).join(', ');
}

// Convert dose to pill text
export function doseToPillText(totalDose, mg) {
    if (!mg || mg === 0) return '';
    const numPills = totalDose / mg;
    const fullPills = Math.floor(numPills);
    const remainder = numPills - fullPills;
    let parts = [];
    if (fullPills > 0) {
        parts.push(`${fullPills} เม็ด`);
    }
    if (Math.abs(remainder - 0.5) < 0.01) {
        parts.push('ครึ่ง');
    } else if (Math.abs(remainder - 0.25) < 0.01) {
        parts.push('หนึ่งส่วนสี่');
    } else if (Math.abs(remainder - 0.75) < 0.01) {
        parts.push('สามส่วนสี่');
    }
    let text = parts.join('');
    if (fullPills === 0 && remainder > 0.01) {
        text += 'เม็ด';
    }
    return text || '0 เม็ด';
}

// Calculate daily dose from pills
export function calculateDailyDose(pills) {
    return pills.reduce((sum, p) => {
        let multiplier = 1;
        if (p.half) multiplier = 0.5;
        else if (p.quarter) multiplier = 0.25;
        return sum + p.mg * p.count * multiplier;
    }, 0);
}
