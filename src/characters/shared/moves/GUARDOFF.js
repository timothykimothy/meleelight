import {tiltTurnDashBuffer, checkForTiltTurn, checkForSmashTurn, checkForDash, checkForSquat, checkForSmashes,
    checkForTilts
    , checkForJump
    , reduceByTraction
    , playSounds
    , actionStates
} from "physics/actionStateShortcuts";
import {characterSelections, player} from "main/main";
import {sounds} from "main/sfx";
import {framesData} from 'main/characters';
export default {
  name : "GUARDOFF",
  canEdgeCancel : true,
  canBeGrabbed : true,
  missfoot : true,
  init : function(p){
    player[p].actionState = "GUARDOFF";
    player[p].timer = 0;
    sounds.shieldoff.play();
    actionStates[characterSelections[p]].GUARDOFF.main(p);
  },
  main : function(p){
    player[p].timer++;
    playSounds("GUARDOFF",p);
    if (!actionStates[characterSelections[p]].GUARDOFF.interrupt(p)){
      reduceByTraction(p,false);
      //shieldDepletion(p);
      //shieldSize(p);
    }
  },
  interrupt : function(p){
    var j = checkForJump(p);
    if (j[0] && !player[p].inCSS){
      actionStates[characterSelections[p]].KNEEBEND.init(p,j[1]);
      return true;
    }
    else if (player[p].timer > framesData[characterSelections[p]].GUARDOFF){
      actionStates[characterSelections[p]].WAIT.init(p);
      return true;
    }
    else if (player[p].phys.powerShielded){
      if (!player[p].inCSS){
        var t = checkForTilts(p);
        var s = checkForSmashes(p);
        if (s[0]){
          actionStates[characterSelections[p]][s[1]].init(p);
          return true;
        }
        else if (t[0]){
          actionStates[characterSelections[p]][t[1]].init(p);
          return true;
        }
        else if (checkForSquat(p)){
          actionStates[characterSelections[p]].SQUAT.init(p);
          return true;
        }
        else if (checkForDash(p)){
          actionStates[characterSelections[p]].DASH.init(p);
          return true;
        }
        else if (checkForSmashTurn(p)){
          actionStates[characterSelections[p]].SMASHTURN.init(p);
          return true;
        }
        else if (checkForTiltTurn(p)){
          player[p].phys.dashbuffer = tiltTurnDashBuffer(p);
          actionStates[characterSelections[p]].TILTTURN.init(p);
          return true;
        }
        else if (Math.abs(player[p].inputs.lsX[0]) > 0.3){
          actionStates[characterSelections[p]].WALK.init(p,true);
          return true;
        }
        else {
          return false;
        }
      }
      else {
        var s = checkForSmashes(p);
        if (s[0]){
          actionStates[characterSelections[p]][s[1]].init(p);
          return true;
        }
        else {
          return false;
        }
      }
    }
    else {
      return false;
    }
  }
};

