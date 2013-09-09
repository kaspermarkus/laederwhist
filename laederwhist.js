var ordering = {
    "8 ren": 0,
    "8 vip (1.)": 1,
    "8 vip (2.)": 2,
    "8 vip (3.)": 3,
    "8 halve": 4,
    "8 sang": 5,
    "8 gode": 6,
    "9 ren": 10,
    "9 vip (1.)": 11,
    "9 vip (2.)": 12,
    "9 vip (3.)": 13,
    "9 halve": 14,
    "9 sang": 15,
    "9 gode": 16,
    "10 ren": 20,
    "10 vip (1.)": 21,
    "10 vip (2.)": 22,
    "10 vip (3.)": 23,
    "10 halve": 24,
    "10 sang": 25,
    "10 gode": 26,
    "11 ren": 30,
    "11 vip (1.)": 31,
    "11 vip (2.)": 32,
    "11 vip (3.)": 33,
    "11 halve": 34,
    "11 sang": 35,
    "11 gode": 36,
    "12 ren": 40,
    "12 vip (1.)": 41,
    "12 vip (2.)": 42,
    "12 vip (3.)": 43,
    "12 halve": 44,
    "12 sang": 45,
    "12 gode": 46,
    "13 ren": 50,
    "13 vip (1.)": 51,
    "13 vip (2.)": 52,
    "13 vip (3.)": 53,
    "13 halve": 54,
    "13 sang": 55,
    "13 gode": 56,
    "sol": 60,
    "ren sol": 61,
    "sol bordlægger": 62
}


var costs = {
    "8": [ 0.75, 1.25, 1.75 ],
    "9": [ 2, 3, 4],
    "10": [ 5, 7, 9 ],
    "11": [ 12, 16, 20 ],
    "12": [ 28, 36, 44 ],
    "13": [ 64, 80, 96 ],
    "sol": 2.5,
    "ren sol": 6,
    "sol bordlægger": 14
};

var bet_types = {
    ren: { bracket: 0 },
    vip: { bracket: [0,1,2] },
    halve: { bracket: 1 },
    sang: { bracket: 1 },
    gode: { bracket: 2 }
};

var whist,
    session,
    currentRound,
    players,
    graphData;

var isNolo = function (type) {
    return (type == "sol" || type == "ren sol" || type == "sol bordlægger");
}

var assignScores = function (amount, winners) {
    $.each(currentRound.activePlayers, function (k, v) {
        if ($.inArray(v, winners) != -1) {
            currentRound.results[v] = (winners.length == 1) ? amount * 3 : amount;
        } else {
            currentRound.results[v] = amount * -1;
        }
    });
};

var calculateScores = function () {
    currentRound.results = {};
    //check general requirements:
    if (currentRound.activePlayers.length != 4 ||
           $.inArray(currentRound.better, currentRound.activePlayers) == -1 ||
           !currentRound.type ||
           !currentRound.stikCost ||
           (currentRound.type == "vip" && !currentRound.numVip)) { 
        //Not everything needed is here so disable submit button and stop calculating       
        $("#submitRound").attr('disabled', 'disabled');
        return;
    }
    //If it's not a nolo game
    if (!isNolo(currentRound.type)) {
        //check that we have everything we need:
        if (currentRound.stik && currentRound.stikWon) {
            //calculate from the perspective of the better/partner
            var diff = currentRound.stikWon - currentRound.stik;
            currentRound.diff = (diff >= 0) ? diff + 1 : diff;
            var amount = currentRound.stikCost * currentRound.diff; 
               
            if (!currentRound.partner || currentRound.partner == currentRound.better) { //if selvmakker:
                assignScores(amount, [currentRound.better]);
            } else { //ikke selvmakker
                assignScores(amount, [ currentRound.better, currentRound.partner]);
            }
            $("#submitRound").removeAttr('disabled');
        } else {
            $("#submitRound").attr('disabled', 'disabled');
        }
    } else { //we are dealing with a nolo game
        //check that we have everything we need:
        if (currentRound.solWon && currentRound.solWon.better != undefined && 
            (currentRound.partner == undefined || (currentRound.solWon.partner != undefined))) {
            //if only one player called sol:
            if (currentRound.partner == undefined || currentRound.better == currentRound.partner) {
                var amount = currentRound.stikCost * (currentRound.solWon.better ? 1 : -1);
                assignScores(amount, [currentRound.better]);
            } else { //if two played the nolo
                if (currentRound.solWon.better && !currentRound.solWon.partner) { //1 of them won
                    $.each(currentRound.activePlayers, function (k, v) {
                        currentRound.results[v] = 0;
                    });
                    currentRound.results[currentRound.better] = currentRound.stikCost * 4;
                    currentRound.results[currentRound.partner] = currentRound.stikCost * -4;
                } else if (!currentRound.solWon.better && currentRound.solWon.partner) { //the other won
                    $.each(currentRound.activePlayers, function (k, v) {
                        currentRound.results[v] = 0;
                    })
                    currentRound.results[currentRound.better] = currentRound.stikCost * -4;
                    currentRound.results[currentRound.partner] = currentRound.stikCost * 4;
                } else if (currentRound.solWon.better && currentRound.solWon.partner) { //both nolos won
                    assignScores(2*currentRound.stikCost, [ currentRound.better, currentRound.partner]);
                } else { //both nolos lost
                    assignScores(-2*currentRound.stikCost, [ currentRound.better, currentRound.partner]);
                }
            }
            $("#submitRound").removeAttr('disabled');
        } else {
            $("#submitRound").attr('disabled', 'disabled');
        }
    }
    return currentRound.results;
};


var getBetName = function (round) {
    var type = round.type;
    if (!round) {
        return "ingen melding valgt"
    } else if (isNolo(round.type)) {
        return type;
    } else {
        return (round.stik?round.stik+" ":"") + type + ((type == "vip" && round.numVip) ? " ("+round.numVip+".)" : "");
    }
};

var updateBetSummary = function () {    
    if (!currentRound.type) {
        $("#betSummary #bet").text("ingen melding valgt");
        $("#betSummary #cost").text("0 kr");
        $("#betSummary #details").text("");
        return;
    } else if (isNolo(currentRound.type)) { //if nolo
        $("#betSummary #cost").text(currentRound.stikCost+" kr");
    } else if (currentRound.type == "vip") {
        currentRound.stikCost = (currentRound.numVip) ? costs[currentRound.stik][currentRound.numVip-1] : "?";
        $("#betSummary #cost").text(currentRound.stikCost+" kr./stik");
    } else {
        $("#betSummary #cost").text(currentRound.stikCost+" kr/stik");
    }
    currentRound.betName = getBetName(currentRound);
    $("#betSummary #bet").text(currentRound.betName);
    var tmp = calculateScores();
    var txt = "";
    if (tmp) {
        $.each(currentRound.activePlayers, function (k, v) {
            if (tmp[v] > 0) txt += "<font class='winner'>"+v+": "+tmp[v]+"</font><br />";
            if (tmp[v] == 0) txt += ""+v+": "+tmp[v]+"<br />";
            if (tmp[v] < 0) txt += "<font class='looser'>"+v+": "+tmp[v]+"</font><br />";
        });
        $("#betSummary #details").html(txt);
    }
};

var markBet = function ( stik, type, v ) {
    //hide/show table with vips depending on game type
    if (type === "vip") {
        $("#vipTable, #stikWonTable").css('visibility','visible');
        $("#solWon").css('visibility','hidden');
    } else  {
        $("#vipTable").css('visibility','hidden');
        if (stik == undefined) { //if nolo
            currentRound.stikCost = costs[type]
            $("#stikWonTable").css('visibility','hidden');
            $("#solWon").css('visibility','visible');
        } else {
            currentRound.stikCost = costs[stik][bet_types[type].bracket];
            $("#stikWonTable").css('visibility','visible');
            $("#solWon").css('visibility','hidden');
        }
    }

    //clear all fields as unselected and mark new
    $("#betTable td, #solTable td").removeClass("selected");
    $(v.target).addClass("selected");
    currentRound.stik = stik;
    currentRound.type = type;
    updateBetSummary();
};



var createBetTable = function () {
    var bet_columns = $("#betTable #betType");
    $.each(bet_types, function (name) {
        var th = $("<th></th>").text(name).addClass(name);
        bet_columns.append(th);

    });
    for (var i=8; i<14; i++) {
        var row = $("<tr></tr>").addClass("row");
        row.append("<th>"+i+"</th>");
        $.each(bet_types, function (ind, val) {
            var td = $("<td>"+((ind !== "vip")?costs[i][val.bracket]:costs[i][0]+"/"+costs[i][1]+"/"+costs[i][2])+"</td>");
            td.data("betData", { stik: i, type: ind });
            var newi = i;
            td.click(function(v) {
                markBet(newi, ind, v);
            });
            row.append(td);

        });
        $("table#betTable").append(row);
    };
};

var setupActivePlayersTable = function () {
    //Draw table    
    var table = $("table#activePlayers tr");

    for (var i=0; i<players.length; i++) {
        var td = $("<td></td>").addClass(players[i]).append(players[i]);
        if ($.inArray(players[i], currentRound.activePlayers) != -1) {
            td.addClass("selected");
        }
        table.append(td);
    };
    drawPlayerTables();


    $("#activePlayers").click(function (v) {
        var el = $(v.target);
        if (el.hasClass("selected")) { //if already selected
            //remove the player from list
            el.removeClass("selected");
            currentRound.activePlayers = jQuery.grep(currentRound.activePlayers, function(value) {
                return value != el.text();
            });
        } else if (currentRound.activePlayers.length < 4) { //if unselected and room for more players                
            el.addClass("selected");
            currentRound.activePlayers.push(el.text());
        }
        //update player tables;
        drawPlayerTables();
        updateBetSummary();

    });
};

var drawPlayerTables = function () {
    drawPlayerTable("betterTable", "Melder", "better").css('visibility','hidden');
    drawPlayerTable("partnerTable", "Makker", "partner").css('visibility','hidden');

    if (currentRound.activePlayers.length == 4) {
        $(".requiresPlayers").css('visibility','visible');
    }
};

var drawPlayerTable = function (tableId, header, type) {
    currentRound[type] = undefined;
    var table = $("table#"+tableId+"").html('');
    table.append("<tr><th colspan=4>"+header+"</th></tr>");

    var activePlayers = currentRound.activePlayers;
    if (activePlayers < 4) {
        //add placeholders:
        table.append("<td></td>");
    }

    for (var i=0; i<activePlayers.length; i++) {
        var td = $("<td></td>").addClass(activePlayers[i]).append(activePlayers[i]);
        td.click(function (v) {
            var el = $(v.target);
            //clear all fields as unselected and mark new
            if (el.hasClass("selected")) {
                $("#"+tableId+" td").removeClass("selected");
                currentRound[type] = undefined;
            } else {
                $("#"+tableId+" td").removeClass("selected");
                $(el).addClass("selected");
                currentRound[type] = el.text();
            }
            updateBetSummary();
        });
        table.append(td);
    };

    return table;
};


var addSolListeners = function () {
    $("#solTable td").click(function (v) {
        var type = $($("#solTable th")[v.target.cellIndex]).text();
        markBet(undefined, type, v);
    });
    $("#solWon td").click(function (v) {
        if (!currentRound.solWon) 
            currentRound.solWon = {};
        var val = (v.target.cellIndex == 1);
        var row = v.target.parentElement.rowIndex;
        currentRound.solWon[(row == 1)?"better":"partner"] = val;
        //mark selected
        $("td", $("#solWon tr")[row]).removeClass("selected");
        $(v.target).addClass("selected");
        updateBetSummary();
    })
}

var addVipListener = function () {
    addRadioCellListener("#vipTable td", function (v) {
        currentRound.numVip = v.target.cellIndex;
        updateBetSummary();
    });
};

var addStikWonListener = function () {
    addRadioCellListener("#stikWonTable td", function (v, el) {
        currentRound.stikWon = parseInt(el.text());
        updateBetSummary();       
    });
};

var addRadioCellListener = function (selector, clickfn) {
    var tds = $(selector);
    tds.click(function (v) {
        tds.removeClass("selected");
        var el = $(v.target);
        el.addClass("selected");
        clickfn(v, el);
    });
};

/* Should be called whenever user submits a round */
var submitRound = function () {
    console.log(JSON.stringify(currentRound)); //log to console
    session.games.push(currentRound); //save to session
    //save session name and comments:
    whist.sessions["id"+session.timestamp] = session;
    //reset currentRound object - only keep 'activePlayers'
    currentRound = { activePlayers: currentRound.activePlayers };
    //remove everything selected:
    $("#outerContainer .selected, #resultContainer .selected").removeClass("selected");
    
    updateBetSummary();
    calculateScores();
    updateScoreTable();
    showScoreTableScreen();

    //save to file via php script
    jQuery.post("laeder_remote.php", 
        JSON.stringify(whist),
        function (a, b, c) {
            console.log(b);
        }, 'json');
}

var initWhist = function () {
    var url = document.location.href;
    //if local, one file, else other
    url = "data/whistklubben"+((url.substring(0, 8) == "file:///")?".local":"")+".json";
    //Get other game info:
    jQuery.ajax({
         url:    url,
         success: function(result, a, b) {
            whist = $.parseJSON(b.responseText);
        },
         async: false,
         cache: false

    }); 

    players = whist.players;
    var match = window.location.search.match(/\?sessionID=(.*)$/);
    if (match && match.length == 2 && whist.sessions[match[1]]) {
        session = whist.sessions[match[1]];
    }

    //if no session is chosen:
    if (!session) {
        var leadZero = function (int) { return int < 10 ? "0"+int : int; };
        var date = new Date();
        var datestr = leadZero(date.getDate())+"-"+leadZero(date.getMonth()+1)+"-"+date.getFullYear();
        session = {
            name: "Nyt Spil",
            ppDate: datestr,
            timestamp: $.now(),
            comments: "Ingen kommentarer",
            games: []
        };
    }
    currentRound = {};
    currentRound.activePlayers = players.slice(0,4);
    $(".headerContainer h1").text("Læderwhist: "+session.name);
}

var setupUI = function () {
    initWhist();
    // initSession();
    setupSessionChooserScreen();
    setupStatisticsControlScreen();
    createBetTable();
    addVipListener();
    addStikWonListener();
    addSolListeners()
    setupActivePlayersTable();
    drawPlayerTables();
    //submit button:
    $("#submitRound").html("Gem Runde").click(submitRound);
    $("#scoresTab").click(showScoreTableScreen);
    $("#betTab").click(showBettingScreen);
    $("#sessionControlTab").click(showSessionControlScreen);
    $("#statisticsTab").click(showStatisticsScreen);
    showSessionControlScreen();
    updateScoreTable();
    $("#vipTable").css('visibility','hidden');
};

var showScoreTableScreen = function () {
    $("#scoreTableScreen").show();
    $("#bettingScreen, #sessionControlScreen, #statisticsScreen").hide()
    $("#scoresTab").addClass("selected");
    $("#betTab, #sessionControlTab, #statisticsTab").removeClass("selected");
    drawScoreGraph(graphData.data, graphData.min, graphData.max);
}

var showBettingScreen = function () {
    $("#bettingScreen").show()
    $("#scoreTableScreen, #sessionControlScreen, #statisticsScreen").hide();
    $("#betTab").addClass("selected");
    $("#scoresTab, #sessionControlTab, #statisticsTab").removeClass("selected");
}

var showSessionControlScreen = function () {
    $("#sessionControlScreen").show()
    $("#scoreTableScreen, #bettingScreen, #statisticsScreen").hide();
    $("#sessionControlTab").addClass("selected");
    $("#scoresTab, #betTab, #statisticsTab").removeClass("selected");    
};

var showStatisticsScreen = function () {
    $("#statisticsScreen").show()
    $("#scoreTableScreen, #bettingScreen, #sessionControlScreen").hide();
    $("#statisticsTab").addClass("selected");
    $("#scoresTab, #betTab, #sessionControlTab").removeClass("selected");
    updateStatistics(whist);
};

var setupSessionChooserScreen = function () {
    var select = $("#sessionChooser");
    select.append("<option value='newgame'>nyt spil</option>");
    $.each(whist.sessions, function (k, v) {
        select.append("<option value='"+k+"'>"+v.ppDate+": "+v.name+"</option>");
    });
    select.val("id"+session.timestamp).change(function (v) {
        document.location.href = ($(v.target).val() == "newgame") ? "?" : "?sessionID="+$(v.target).val();
    });
    $("#sessionNameArea input").val(session.name).blur(function (v) {
        session.name = $(v.target).val();
        $(".headerContainer h1").text("Læderwhist: "+session.name);
    });
    $("#sessionCommentsArea textarea").text(session.comments).blur(function (v) {
        session.comments = v.target.value;
    });
};

var setupStatisticsControlScreen = function () {
    var select = $("#statisticsGameSelect");
    select.append("<option value='default'>alle spil</option>");
    $.each(whist.sessions, function (k, v) {
        select.append("<option value='"+k+"'>"+v.ppDate+": "+v.name+"</option>");
    });
    select.change(function (v) {
        ($(v.target).val() == "default") ? updateStatistics(whist) : singleGameStatistics($(v.target).val());
        $("#statisticsPlayerSelect").val("default");
    });

    select = $("#statisticsPlayerSelect");
    select.append("<option value='default'>alle spillere</option>");
    $.each(whist.players, function (k, v) {
        select.append("<option value='"+k+"'>"+v+"</option>");
    });
    select.change(function (v) {
        ($(v.target).val() == "default") ? updateStatistics(whist) : singlePlayerStatistics($(v.target).val());
        $("#statisticsGameSelect").val("default");
    });   
};

var updateScoreTable = function () {
    var tbl = $("#scoreTable");
    tbl.html("");
    graphData = {
        data: {},
        min: 0,
        max: 0
    }
    var indices = {};
    var totals = {};
    var round, td;
    //create headers with names:
    var tr = $("<tr></tr>").addClass("playerNames");   
    var firstRow = $("<tr></tr>").append("<th class='betHeader'>Spil start</th>"); 
    var newRow = $("<tr></tr>").append("<th>a</th>");
    tr.append("<th>melding</th>");
    $.each(players, function (k, v) {
        tr.append("<th>"+v+"</th>");
        newRow.append("<td></td>");
        firstRow.append("<td>0</td>");
        indices[v]= k+2;
        totals[v] = 0;
        graphData.data[v] = [[0,0]];
    });
    tbl.append(tr);
    tbl.append(firstRow);
    for (var i=0; i<session.games.length; i++) {
        round = session.games[i];        
        round.totals = {};
        
        //copy new row:
        tr = $("<tr>"+newRow.html()+"</tr>").data(round).addClass("round"+i);
        $("th", tr).text("runde "+(i+1)+": "+round.betName).addClass("betHeader");

        var activePlayers = round.activePlayers;
        $.each(players, function (k, v) {            
            var score =  round.results[v];
            //add to totals:
            totals[v] = totals[v]+(score?score:0);
            round.totals[v] = totals[v];  

            //save graph info
            graphData.data[v].push([i+1, totals[v]])
            if (totals[v] < graphData.min) graphData.min = totals[v]-2;
            if (totals[v] > graphData.max) graphData.max = totals[v]+2;
        });
        printScores("totals", { target: tr }, indices);

        tr.mouseover(function (v) {
            printScores("results", v, indices, "hovered");
        }).mouseleave(function (v) {
            printScores("totals", v, indices);
        });
        
        tbl.append(tr);
    }
}


/*
 * print value from 'field' in the data provided in the tr
 */
var printScores = function (field, v, indices, extraClass) {
    var tr = $(v.target).is("td") ? $(v.target.parentNode) :  $(v.target);
    var round = tr.data();

    var activePlayers = round.activePlayers;
    $.each(activePlayers, function (key, val) {
        var score = round[field][val];
        var colorClass = "neutral";
        if (score > 0) colorClass = "winner";
        if (score < 0) colorClass = "looser";
          
        var td = $("td:nth-child("+indices[val]+")", tr).html(score).removeClass().addClass(colorClass);
        if (extraClass)
            td.addClass(extraClass);
        if (val == round.better) { //bold if better
            td.addClass("bold");
        }
    });

};

var test = function (a) {
    var roundnr = Math.round(a.x)-1;
    var round = session.games[roundnr];
    var str = "<small><b>Runde "+(roundnr+1)+": "+round.betName+"</b>";
    if (!isNolo(round.type)) {
        str += "<br />Stik vundet: "+round.stikWon+" <font class='"+((round.diff<0)?"looser":"winner")+"'>("+(round.stikWon-round.stik)+")</font>";
    }
    $.each(round.results, function (k, v) {
        var classstr = "";        
        if (v < 0) classstr="looser";
        if (v > 0) classstr="winner";      
        str += "<br /><font class='"+classstr+"'>"+k+": "+v+" kr.</font>";
    });
    return str+"</small>";
};

var drawScoreGraph = function (data, min, max) {

    var container = document.getElementById('scoreGraph');
    var arr = [];
    arr.push({ data : [[0,0],[data[players[0]].length,0]], shadowSize : 0, color : '#545454' }); // Horizontal)
    $.each(data, function (k, v) {
        arr.push({data: v, label: k, points : { show : true }, lines: { show: true }});
    });

    graph = Flotr.draw(container, arr, 
        {
            HtmlText: false,
            xaxis: {
                tickFormatter: function (n) { return "Round "+Math.round(n); },
                labelsAngle : 90
            },
            yaxis: {
                tickFormatter: function (n) { return n+" Kr."; },
                min: min,
                max: max
            },
            grid: {
                verticalLines: false
            },
            mouse: {
                track: true,
                trackFormatter: test,
                sensibility: 20
            }
        });
};







/*
*
*
*
*

S
T
A
T
I
S
T
I
C
S

*
*
*
*
*/

var singleGameStatistics = function (session_id) {
    var singleGameWhist = $.extend(true, {}, whist);
    singleGameWhist.sessions = {};
    singleGameWhist.sessions[session_id] = whist.sessions[session_id];
    updateStatistics(singleGameWhist);
}

var singlePlayerStatistics = function (playerind) {
    var playername = whist.players[playerind];
    var singlePlayerWhist = $.extend(true, {}, whist);
    singlePlayerWhist.sessions = {};
    $.each(whist.sessions, function (session_id, session) {
        var newSession = {};
        $.each(session.games, function (ind, game) {
            if (game.better == playername) {
                if (!newSession.games) {
                    newSession.games = [];
                }
                newSession.games.push(game);
            }
        });
        if (!$.isEmptyObject(newSession)) {
            singlePlayerWhist.sessions[session_id] = newSession;
        }
    });
    updateStatistics(singlePlayerWhist);
}

var updateStatistics = function (whist) {
    var gamestats = collectStatistics(whist);

    //draw game summary diagram:
    var ordered = [];
    $.each(gamestats.gametypes, function (k, v) {
        ordered.push(k);
    });  
    ordered.sort(function (a, b) { return ordering[a] - ordering[b]; });

    drawGameTypeGraph(gamestats, ordered);
    drawGameTypeTable(gamestats, ordered);
    drawGameSummaryGraphs(gamestats);

}
var collectStatistics = function (whist) {
    var gamestats = { 
        gametypes: {},
        numRounds: 0,
        numWon: 0,
        numLost: 0,
        selvmakker: 0,
        selvmakkerWins: 0,
        winnings: [],
        stikDiffs: [],
        winnings: {
            raw: [],
            max: 0,
            min: 0,
            sum: 0,
            sumPos: 0,
            sumNeg: 0
        },          
        stikDiffs: {
            raw: [],
            max: 0,
            min: 0,
            sum: 0,
            sumPos: 0,
            sumNeg: 0
        },
        selvmakker: 0,
        selvmakkerWins: 0
    };

    //collect info about each game type:
    var sessions = whist.sessions;
    $.each(sessions, function (sessionid, session) {
        var games = session.games;
        $.each(games, function (gameindex, game) {
            collectGameTypeStats(gamestats.gametypes, game);
        });
    });
    collectOverallGameStats(gamestats);

    return gamestats;
}

var collectOverallGameStats = function (gamestats) {
    var gtypes = gamestats.gametypes
    $.each(gtypes, function (k, v) {
        gamestats.numLost += v.numLost;
        gamestats.numWon += v.numWon;
        gamestats.numRounds += v.numRounds;
        gamestats.selvmakker += v.selvmakker;
        gamestats.selvmakkerWins += v.selvmakkerWins;
        //gamestats.winnings = $.merge(gamestats.winnings, v.winnings);
        //gamestats.stikDiffs = $.merge(gamestats.stikDiffs, v.stikDiffs);
        gamestats.winnings.sum += v.winnings.sum;
        gamestats.winnings.max = Math.max(gamestats.winnings.max, v.winnings.max);
        gamestats.winnings.min = Math.min(gamestats.winnings.min, v.winnings.min);
        gamestats.winnings.sumPos += v.winnings.sumPos;
        gamestats.winnings.sumNeg += v.winnings.sumNeg;
        gamestats.stikDiffs.sum += v.stikDiffs.sum;
        gamestats.stikDiffs.max = Math.max(gamestats.stikDiffs.max, v.stikDiffs.max);
        gamestats.stikDiffs.min = Math.min(gamestats.stikDiffs.min, v.stikDiffs.min);
        gamestats.stikDiffs.sumPos += v.stikDiffs.sumPos;
        gamestats.stikDiffs.sumNeg += v.stikDiffs.sumNeg;
    });
};

var collectGameTypeStats = function (gametypestats, game) {
    //ensure entry for each gamename found:
    if (!gametypestats[game.betName]) {
        gametypestats[game.betName] = {
            numRounds: 0,
            numWon: 0,
            numLost: 0,
            winnings: {
                raw: [],
                max: 0,
                min: 0,
                sum: 0,
                sumPos: 0,
                sumNeg: 0
            },          
            stikDiffs: {
                raw: [],
                max: 0,
                min: 0,
                sum: 0,
                sumPos: 0,
                sumNeg: 0
            },
            selvmakker: 0,
            selvmakkerWins: 0
        };                
    }
    //update gamestats based on entry
    var currentEntry = gametypestats[game.betName];
    var betterWinAmount = game.results[game.better];
    currentEntry.numRounds++;
    currentEntry.winnings.sum += betterWinAmount;

    if (betterWinAmount < 0) {
        currentEntry.numLost++;
        currentEntry.winnings.sumNeg += betterWinAmount;
        currentEntry.winnings.min = Math.min(betterWinAmount, currentEntry.winnings.min);
    } else {
        currentEntry.numWon++;
        currentEntry.winnings.sumPos += betterWinAmount;
        currentEntry.winnings.max = Math.max(betterWinAmount, currentEntry.winnings.max);
    }
    currentEntry.winnings.raw.push(betterWinAmount);
    if (!isNolo(game.type)) {
        
        //fix stik diff calculations
        currentEntry.stikDiffs.raw.push(game.diff);
        currentEntry.stikDiffs.sum += game.diff;
        if (game.diff < 0) {
            currentEntry.stikDiffs.sumNeg += game.diff;
            currentEntry.stikDiffs.min = Math.min(game.diff, currentEntry.stikDiffs.min);
        } else {
            currentEntry.stikDiffs.sumPos += game.diff;
            currentEntry.stikDiffs.max = Math.max(game.diff, currentEntry.stikDiffs.max);
        }
        //check for selvmakker cases:
        if (game.better == game.partner) {
            currentEntry.selvmakker++;
            if (betterWinAmount > 0) {
                currentEntry.selvmakkerWins++;
            }
        }
    }
};

var drawGameTypeRow = function (obj, header, cssclass) {
    var tr = $("<tr></tr>").addClass((cssclass)?cssclass:"")
        .append("<th>"+header+"</th>")
        .append("<td>"+obj.numRounds+"<br />("+getPercent(obj.numRounds, obj.numRounds)+"%)</td>")
        .append("<td>"+obj.numWon+"<br />("+getPercent(obj.numWon, obj.numRounds)+"</td>")
        .append("<td>"+obj.numLost+"<br />("+getPercent(obj.numLost, obj.numRounds)+"</td>")
        .append("<td>"+(obj.winnings.sumPos/obj.numWon).toFixed(2)+" kr<br />("+(obj.stikDiffs.sumPos/obj.numWon).toFixed(2)+")</td>")
        .append("<td>"+(obj.winnings.sumNeg/obj.numLost).toFixed(2)+" kr<br />("+(obj.stikDiffs.sumNeg/obj.numLost).toFixed(2)+")</td>")
        .append("<td>"+obj.winnings.max+" / "+(obj.winnings.sum/obj.numRounds).toFixed(2)+" / "+obj.winnings.min+"</td>")
        .append("<td>"+obj.stikDiffs.max+" / "+(obj.stikDiffs.sum/obj.numRounds).toFixed(2)+" / "+obj.stikDiffs.min+"</td>");
    return tr;   
}

var drawGameTypeTable = function (gamestats, ordered) {
    var table = $("#gametypeStatisticsTable").addClass("table striped").html("");
    var tr = $("<tr></tr>")
        .append("<th>Melding</th>")
        .append("<th>antal meldinger (%)</th>")
        .append("<th>antal vundne (%)</th>")
        .append("<th>antal tabte (%)</th>")
        .append("<th>snit vundet (stik)</th>")
        .append("<th>snit tabt (stik)</th>")
        .append("<th>max/snit/min fortjeneste</th>")
        .append("<th>max/snit/min stik</th>")
    table.append(tr);

    for (var i=0; i<ordered.length; i++) {
        var type = gamestats.gametypes[ordered[i]];
        table.append(drawGameTypeRow(type, ordered[i]));
    };
    table.append(drawGameTypeRow(gamestats, "I alt", "summary"));
};       

var getPercent = function (num, sum) {
    return (100*num/sum).toFixed(2);
}

var drawGameTypeGraph = function (gamestats, ordered) {
    var graph = $("#gametypeStatisticsGraph").addClass("graph");    

    var indices = [],
        winners = [],
        loosers = [];

    for (var i=0; i<ordered.length; i++) {
        var type = gamestats.gametypes[ordered[i]];
        winners.push([i, 100*type.numWon/gamestats.numRounds]);
        loosers.push([i, 100*type.numLost/gamestats.numRounds]);
    }

    Flotr.draw(graph[0],[
        { data : loosers, label : 'Tabt' },
        { data : winners, label : 'Vundet' }
      ], {
        title: "Meldinger relativt til samlede antal spil",
        colors: [ "#CB4B4B", "#90D800" ],
        HtmlText: false,
        legend : {
          backgroundColor : '#D2E8FF' // Light blue 
        },
        bars : {
          show : true,
          stacked : true,
          horizontal : false,
          barWidth : 0.6,
          lineWidth : 2,
          shadowSize : 0
        },
        grid : {
          verticalLines : false,
          horizontalLines : true
        },
        xaxis: {
            tickFormatter: function (n) { return ordered[Math.round(n)]; },
            labelsAngle: 270,
            noTicks: winners.length
        },
        yaxis: {
            tickFormatter: function (n) { return Math.round(n)+" %"; },
            title: "% af samlede antal spil"
        },
        mouse: {
            track: true,
            trackFormatter: function (a) {
                var roundnr = Math.round(a.x);
                var typename = ordered[roundnr];
                var type = gamestats.gametypes[typename];
                var str = "<b>"+typename+"<br />";
                str += "<small><font class='winner'>"+type.numWon+" vundet</font><br />";
                str += "<font class='looser'>"+type.numLost+" tabt</font><br />";
                str += "<hr>";
                str += "<font>"+type.numRounds+" i alt</font><br />";
                return str+"<b></small>";
            }
        }
    });
};

var drawGameSummaryGraphs = function (gamestats) {
    var graph = $("#summaryGraphsArea").text("");
    var div = $("<div></div>").addClass("summarygraph-left");
    graph.append(div);
    drawSingleGameSummaryGraph(div[0], gamestats.numWon, gamestats.numLost, gamestats.numRounds, "runder spillet: ");
    div = $("<div></div>").addClass("summarygraph-right");
    graph.append(div);
    drawSingleGameSummaryGraph(div[0], gamestats.selvmakkerWins, gamestats.selvmakker-gamestats.selvmakkerWins, gamestats.selvmakker, "selvmakkere spillet: ");
}

var drawSingleGameSummaryGraph = function (elem, numWon, numLost, numRounds, header) {

      var
        d1 = [[0, numWon]],
        d2 = [[0, numLost]];

      Flotr.draw(elem, [
        { data : d1, label : 'Vundet ('+numWon+")" },
        { data : d2, label : 'Tabt ('+numLost+")" ,
          pie : {
            explode : 10
          }
        }
      ], {
        colors: [ "#90D800", "#CB4B4B" ],
        HtmlText : false,
        grid : {
          verticalLines : false,
          horizontalLines : false
        },
        xaxis : { showLabels : false },
        yaxis : { showLabels : false },
        pie : {
          show : true, 
          explode : 0
        },
        legend : {
          position : 'se',
          backgroundColor : '#D2E8FF'
        },
        title: header+numRounds
      });
};