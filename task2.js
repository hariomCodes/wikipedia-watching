const fiveMinArray = [];
const EventSource = require('eventsource');
const domainsMap = new Map();
const usersMap = new Map();
const fiveMinDomainsMap = new Map();
const fiveMinUsersMap = new Map();
// "recentchange" can be replaced with any valid stream
const url = 'https://stream.wikimedia.org/v2/stream/revision-create';
const eventSource = new EventSource(url);

eventSource.onopen = () => {
    console.info('Opened connection.');
};
eventSource.onerror = (event) => {
    console.error('Encountered error', event);
};



eventSource.onmessage = (event) => {
    // event.data will be a JSON string containing the message
    const data = JSON.parse(event.data);
    
    const domain = data.meta.domain;
    if(!domainsMap.has(domain)){
        domainsMap.set(domain, 1);
    }else{
        domainsMap.set(domain,domainsMap.get(domain) + 1);
    }

    if(domain === 'en.wikipedia.org' && !data.performer.user_is_bot){
        const userName = data.performer.user_text;
        if(!usersMap.has(userName)){
            usersMap.set(userName, 1);
        }else{
            usersMap.set(userName, usersMap.get(userName) + 1);
        }
    }
    
};

function getOneMinuteArray(map){
    output = [...map];
    map.clear();
    return output
}

function pushToFiveMinutesArray(domainArr,userArr){
    fiveMinArray.push([domainArr, userArr]);
}

function setCombinedMap(domainArr, userArr){
    for(let domain of domainArr){
        if(!fiveMinDomainsMap.has(domain[0])){
            fiveMinDomainsMap.set(domain[0],domain[1]);
        }else{
            fiveMinDomainsMap.set(domain[0], fiveMinDomainsMap.get(domain[0]) + domain[1]);
        }
    }

    for(let user of userArr){
        if(!fiveMinUsersMap.has(user[0])){
            fiveMinUsersMap.set(user[0],user[1]);
        }else{
            fiveMinUsersMap.set(user[0], fiveMinUsersMap.get(user[0]) + user[1]);
        }
    }
}

function getMergedArray(fiveMinArray){
    let i = 0;
    if(fiveMinArray.length >= 5){
        i = fiveMinArray.length - 5;
    }
    for(i; i < fiveMinArray.length; i++){
        setCombinedMap(fiveMinArray[i][0],fiveMinArray[i][1]);
    }
    return [[...fiveMinDomainsMap],[...fiveMinUsersMap]];

}

function sortArray(arr){
    return arr.sort((a,b) => b[1] - a[1]);
}

function printOutput(fiveMinArray){
    const [domainArr, userArr] = getMergedArray(fiveMinArray);
    sortArray(domainArr);
    sortArray(userArr);

    console.log(`Total numbers of wikipedia domains updated: ${domainArr.length}`);
    console.log('');
    for(let domain of domainArr){
        console.log(`${domain[0]}: ${domain[1]} pages updated`);
    }
    console.log('');

    console.log(`Users who made changes to en.wikipedia.org`);
    console.log('');
    for(let user of userArr){
        console.log(`${user[0]}: ${user[1]}`);
    }
    console.log('');
}

setInterval(() => {
    pushToFiveMinutesArray(getOneMinuteArray(domainsMap),getOneMinuteArray(usersMap));
    printOutput(fiveMinArray);
    domainsMap.clear();
    usersMap.clear();
    fiveMinDomainsMap.clear();
    fiveMinUsersMap.clear();
},6000);