const inOneMinute = [];
const inFiveMinutes = [];
const EventSource = require('eventsource');
const domainsMap = new Map();
const usersMap = new Map();

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
    // Edits from the English Wikipedia
    // if (data.wiki === "enwiki") {
        // Output the page title
        // console.log(data);
    // }
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
// this function invokes after every one minute
// and then logs the data collected in one minute
// and then deletes the data.
setInterval(() => {
    
    const domainsArr = [...domainsMap].sort((a,b) => b[1] -a[1]);
    console.log(`Total numbers of wikipedia domains updated: ${domainsArr.length}`);
    console.log('----------------------------------------------------------------');

    console.log('');
    for(let domain of domainsArr){
        console.log(`${domain[0]}: ${domain[1]} pages updated`);
    }
    console.log('');
    
    const usersArr = [...usersMap].sort((a,b) => b[1]-a[1]);
    console.log(`Users who made changes to en.wikipedia.org`);
    console.log('------------------------------------------');
    console.log('');
    for(let user of usersArr){
        console.log(`${user[0]}: ${user[1]}`);
    }
    console.log('');

    
    domainsMap.clear();
    usersMap.clear();
},60000);