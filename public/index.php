<?php
ini_set('display_errors', 1);
error_reporting(~0);

session_start();
if (!isset($_SESSION["username"])) {
  header("location:login.html");
}
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Læderwhist</title>
    <link rel="stylesheet" type="text/css" href="laederwhist.css">
    <link rel="icon" type="image/jpeg" href="http://kasper.markus.dk/laederwhist/favicon.png">
  </head>
  <body>
    <script type="text/javascript" src="lib/jquery.js"></script>
    <script type="text/javascript" src="lib/flotr2.min.js"></script>

    <div id="logoutArea">
      <a href="logout.php">Log out</a>
    </div>
    <div id="downloadDataArea">
      <a id="downloadDataLink">Download Backup</a>
    </div>
    <div id="tabs" class="tabs">
      <ul>
        <li id="sessionControlTab" class="tab selected"><font>spil styring</font></li>
        <li id="betTab" class="tab"><font>melding</font></li>
        <li id="scoresTab" class="tab"><font>scores</font></li>
        <li id="statisticsTab" class="tab"><font>statistik</font></li>
        <li id="skyldeposenTab" class="tab"><font>skyldeposen</font></li>
      </ul>
    </div>
    <div id="headerPling">
      <div id="headerShader">
        <div class="headerContainer">
          <h1>Læderwhist</h1>
          <table id="activePlayers"><tr><th>Active Spillere:</th></tr></table>
        </div>
      </div>
    </div>
    <div id="bettingScreen" class="screen">
      <div id="whiteShadeContainer">
        <div id="darkShadeContainer">
          <div id="outerContainer">
            <div class="betArea">
              <div class="betTables">
                <table id="betTable" class="striped">
                  <tr id="betType">
                    <th></th>
                  </tr>
                </table>
                <table id="solTable" class="verticalStriped">
                    <tr class="betType">
                      <th>sol</th>
                      <th>ren sol</th>
                      <th>sol bordlægger</th>
                    </tr>

                    <tr>
                      <td>2.50</td>
                      <td>6</td>
                      <td>14</td>
                    </tr>
                </table>
              </div>
              <div id="betDetailsTable">

                <table id="vipTable" class="verticalStriped">
                  <tr><th>Vip</th><td>1.</td><td>2.</td><td>3.</td></tr>
                </table>

                <table id="betterTable" class="requiresPlayers verticalStriped"></table>
                <table id="partnerTable" class="requiresPlayers verticalStriped"></table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="bottomBetContainer">
        <div id="resultContainer">
          <table id="stikWonTable" class="verticalStriped">
            <tr>
              <th colspan=13>Stik vundet</th>
            </tr>
            <tr>
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td>4</td>
              <td>5</td>
              <td>6</td>
              <td>7</td>
              <td>8</td>
              <td>9</td>
              <td>10</td>
              <td>11</td>
              <td>12</td>
              <td>13</td>
            </tr>
          </table>
          <table id="solWon" class="verticalStriped">
            <tr>
              <th colspan=3>Sol Resultater</th>
            </tr>
            <tr>
              <th>Melder vandt</th>
              <td>ja</td>
              <td>nej</td>
            </tr>
            <tr>
              <th>'Makker' vandt</th>
              <td>ja</td>
              <td>nej</td>
            </tr>
          </table>
        </div>
        <div id="betSummary">
          <div id="bet"></div>
          <div id="cost"></div>
          <div id="details"></div>
          <button id="submitRound"></button>
        </div>
      </div>
    </div>
    <div id="scoreTableScreen" class="screen">
      <div id="scoreGraphContainer"><div id="scoreGraph"></div></div>
      <div id="scoreTableContainer">
        <table id="scoreTable" class="striped"></table>
      </div>
    </div>
    <div id="sessionControlScreen" class="screen">
      <div id="sessionChooserContainer">vælg andet spil:
        <select id="sessionChooser"></select>
      </div>
      <div id="currentSessionContainer"><h1>Spil information</h1>
        <div id="sessionNameArea">
          Spil navn: <input type="text" />
        </div>
        <div id="sessionCommentsArea">
          Kommentarer: <br /><textarea></textarea>
        </div>
      </div>
    </div>
    <script type="text/javascript" src="laederwhist.js"></script>
    <div id="statisticsScreen" class="screen">
      <div id="statisticsControlContainer">
        vælg aften: <select id="statisticsGameSelect"></select>
        vælg spiller 1: <select id="statisticsPlayerSelect1"></select>
        vælg spiller 2: <select id="statisticsPlayerSelect2"></select>
      </div>
      <div id="generalStatsContainer">
        <h1>Generelle Stats</h1>
        <div id="generalStats">
          <p><span id="numberOfSessions" class="number">20</span> whist aftener</p>
          <p><span id="numberOfRounds" class="number">1000</span> runder spillet</p>
          <p><span id="numberOfGamesPerSession" class="number">20</span> gennemsnitlige spil/aften</p>
        </div>
      </div>
      <div id="greatestGamesStatsTables">
        <div class="greatestGamesStatsTableContainer">
          <h1>Største gevinst på et enkelt spil</h1>
          <table id="greatestWinTable"></table>
        </div>
        <div class="greatestGamesStatsTableContainer">
          <h1>Største tab på et spil</h1>
          <table id="greatestLossTable"></table>
        </div>
        <div class="greatestGamesStatsTableContainer">
          <h1>Største melding</h1>
          <table id="highestBetTable"></table>
        </div>
      </div>
      <div id="gametypeStatisticsGraph"></div>
      <table id="gametypeStatisticsTable"></table>
      <div id="summaryGraphsArea"></div>
    </div>

    <div id="skyldeposenScreen" class="screen">
      <div id="skyldeposenSummary"></div>

      <div id="skyldeposenTableContainer">
        <table id="skyldeposenTable" class="striped"></table>
      </div>

      <div id="skyldePosenPaidTableContainer">
        <table id="skyldeposenPaidTable"></table>
      </div>
    </div>

   <script>
   setupUI();
   </script>

 </body>
 </html>