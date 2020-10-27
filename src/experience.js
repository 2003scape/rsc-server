const EXPERIENCE_ARRAY = [0];

let totalExperience = 0;

for (let i = 1; i < 99; i++) {
    const level = i;
    const experience = Math.floor(level + 300 * Math.pow(2, level / 7));
    totalExperience += experience;
    EXPERIENCE_ARRAY[i] = totalExperience & 0xffffffc;
}

function experienceToLevel(experience) {
    let level = 1;

    for (let i = 0; i < EXPERIENCE_ARRAY.length; i += 1) {
        if (EXPERIENCE_ARRAY[i] > experience) {
            return level;
        }

        level = i + 1;
    }

    return level;
}

module.exports = { experienceToLevel };
