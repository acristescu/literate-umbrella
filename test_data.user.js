// ==UserScript==
// @name         Test data
// @namespace    http://tampermonkey.net/
// @version      2024-11-22
// @description  add test stints to a google sheet
// @author       Alexandru Cristescu
// @match        https://*.gpro.net/gb/Testing.asp
// @match        https://*.gpro.net/gb/gpro.asp
// @updateURL    https://raw.githubusercontent.com/acristescu/literate-umbrella/refs/heads/main/test_data.user.js
// @downloadURL  https://raw.githubusercontent.com/acristescu/literate-umbrella/refs/heads/main/test_data.user.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

(function() {
    'use strict';

    if(window.location.href.endsWith("gpro.asp")) {
        let nameElement = document.querySelector('#item-1 > h1 > a.nobold')
        let name = null
        if(nameElement == null) {
            name = $('#managerinformation > a.nobold').text()
        } else {
            name = nameElement.innerHTML
        }
        const raceText = $("#racebar > h1").text()
        const match = raceText.match(/Season (\d+), Race (\d+)/)
        const season = match[1]
        const race = match[2]

        localStorage.setItem('name', name)
        localStorage.setItem('season', season)
        localStorage.setItem('race', race)

        console.log("saved name, season and race locally")
        return
    }

    const name = localStorage.getItem('name')
    const season = localStorage.getItem('season')
    const race = localStorage.getItem('race')

    console.log(`${name}\t${season}\t${race}`)

    const thText = $("th:contains('stints done')").text()
    const match = thText.match(/stints done: (\d+)\/10/)
    if (!match) {
        console.error("Failed to extract stint number.")
        return
    }

    const stintsDone = match[1]; // The current stint number
    console.log("Stints Done:", stintsDone);

    let lastLaps = null
    if(stintsDone > 0) {
        lastLaps = $(`#formQual > div.column.sixtyfive.right > div > table:nth-child(1) > tbody > tr:nth-child(${3+parseInt(stintsDone)}) > td:nth-child(2)`).text().trim().split("/")[0]
        console.log("Last Stint laps:", lastLaps)
    }

    const current = {
        fw_lvl: $("td:contains('Front wing:')").next().text(),
        fw_wear: $("td:contains('Front wing:')").next().next().text().slice(0,-1),

        rw_lvl: $("td:contains('Rear wing:')").next().text(),
        rw_wear: $("td:contains('Rear wing:')").next().next().text().slice(0,-1),

        en_lvl: $("td:contains('Engine:')").next().text(),
        en_wear: $("td:contains('Engine:')").next().next().text().slice(0,-1),

        br_lvl: $("td:contains('Brakes:')").next().text(),
        br_wear: $("td:contains('Brakes:')").next().next().text().slice(0,-1),

        gb_lvl: $("td:contains('Gear:')").next().text(),
        gb_wear: $("td:contains('Gear:')").next().next().text().slice(0,-1),

        su_lvl: $("td:contains('Suspension:')").next().text(),
        su_wear: $("td:contains('Suspension:')").next().next().text().slice(0,-1),

        ch_lvl: $("td:contains('Chassis:')").next().text(),
        ch_wear: $("td:contains('Chassis:')").next().next().text().slice(0,-1),

        ub_lvl: $("td:contains('Underbody:')").next().text(),
        ub_wear: $("td:contains('Underbody:')").next().next().text().slice(0,-1),

        si_lvl: $("td:contains('Sidepods:')").next().text(),
        si_wear: $("td:contains('Sidepods:')").next().next().text().slice(0,-1),

        co_lvl: $("td:contains('Cooling:')").next().text(),
        co_wear: $("td:contains('Cooling:')").next().next().text().slice(0,-1),

        el_lvl: $("td:contains('Electronics:')").next().text(),
        el_wear: $("td:contains('Electronics:')").next().next().text().slice(0,-1)
    }

    let newData = function() {
        return {
                before: [null,null,null,null,null,null,null,null,null,null],
                after: [null,null,null,null,null,null,null,null,null,null],
                laps: [null,null,null,null,null,null,null,null,null,null],
            }
    }

    let savedData = JSON.parse(localStorage.getItem(`testing_data_s${season}`))
    if(!savedData) {
        savedData = {
            "r1": newData(),
            "r2": newData(),
            "r3": newData(),
            "r4": newData(),
            "r5": newData(),
            "r6": newData(),
            "r7": newData(),
            "r8": newData(),
            "r9": newData(),
            "r10": newData(),
            "r11": newData(),
            "r12": newData(),
            "r13": newData(),
            "r14": newData(),
            "r15": newData(),
            "r16": newData(),
            "r17": newData(),
        }
    }

    let currentRaceData = savedData[`r${race}`]

    if(stintsDone > 0 && currentRaceData.after[stintsDone - 1] == null) {
        currentRaceData.after[stintsDone - 1] = current
    }

    if(stintsDone > 0 && lastLaps != null) {
        currentRaceData.laps[stintsDone - 1] = lastLaps
    }

    if(stintsDone < 10) {
        currentRaceData.before[stintsDone] = current
    }

    localStorage.setItem(`testing_data_s${season}`, JSON.stringify(savedData))

    const parts = ['ch', 'en', 'fw', 'rw', 'ub', 'si', 'co', 'gb', 'br', 'su', 'el']
    let string = ""

    for(let r = 1; r<=17 ; r++) {
        for(let s = 0; s<10 ; s++) {
            let before = savedData[`r${r}`].before[s]
            let after = savedData[`r${r}`].after[s]
            let laps = savedData[`r${r}`].laps[s]
            if(before != null && after != null) {
                string += `${name}\t${r}\t${s}\t${laps}\t`
                for(let p = 0; p<11; p++) {
                    string += `${before[parts[p]+'_lvl']}\t${after[parts[p]+'_wear'] - before[parts[p]+'_wear']}\t`
                }
                string += '\n'
            }
        }
    }

    console.log(string)

    fetch('https://script.google.com/macros/s/AKfycbxLluI5zl6lAa5yLyo7qNBAXVKzNluEIM8KVYXP7OtOD_244-S2Gpc8pjmjFdOtVFBQ/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        redirect: "follow",
        body: string.trim()
    })
        .then(response => response.json())
        .then(result => console.log('Data uploaded:', result))
        .catch(error => console.error('Error uploading data:', error));
    console.log(savedData)

})();
